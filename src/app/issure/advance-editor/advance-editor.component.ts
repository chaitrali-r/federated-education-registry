import { Component, OnInit, Input } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { Formio } from 'formiojs';

import { editorConfig } from './advance-editor-config';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'advance-editor',
  templateUrl: './advance-editor.component.html',
  styleUrls: ['./advance-editor.component.scss']
})
export class AdvanceEditorComponent implements OnInit {
  @Input() jsonSchema;
  @ViewChild('json') jsonElement?: ElementRef;
  public editorOptions: JsonEditorOptions;
  public vcEditorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent) jsonEditor: JsonEditorComponent;
  @ViewChild(JsonEditorComponent) vcEditor: JsonEditorComponent;

  @Output() newItemEvent = new EventEmitter<any>();

  public myForm: Object = { components: [] };
  public options = editorConfig;
  eventForm: any;
  jsonFields: any;
  vcFields: any;
  jsonTitle: any;
  propertyArr: any;
  vcFieldsText: any;
  isShowLessJson = false;
  isShowLessVc = false;
  isVcString = false;
  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.history = true;
    this.editorOptions.onChange = () => this.jsonEditor.get();

    this.vcEditorOptions = new JsonEditorOptions();
    this.vcEditorOptions.mode = 'text';
    this.vcEditorOptions.history = true;
    this.vcEditorOptions.onChange = () => this.vcEditor.get();
  }

  showLessJson() {
    this.isShowLessJson = !this.isShowLessJson;
  }

  showLessVc() {
    this.isShowLessVc = !this.isShowLessVc;
  }

  ngOnInit(): void {
    this.formioJsonBuild(this.jsonSchema);

    var coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  }

  formioJsonBuild(jsonFields) {

    if (typeof (jsonFields['_osConfig']['credentialTemplate']) == 'string') {
      fetch(jsonFields['_osConfig']['credentialTemplate'])
        .then(response => response.text())
        .then(data => {
          this.vcFields = data;
          console.log(data);
          this.isVcString = true;
        });

    } else {
      this.isVcString = false;
      this.vcFields = jsonFields['_osConfig']['credentialTemplate'];
    }

    delete jsonFields['_osConfig']['credentialTemplate'];
    this.jsonSchemaToFormioConvrt(jsonFields);


  }

  jsonSchemaToFormioConvrt(jsonFields)
  {
    this.myForm['components'] = [];
    this.jsonFields = jsonFields;
    this.jsonTitle = jsonFields['title'];
    let jsonSchema = jsonFields.definitions[this.jsonTitle].properties;

    this.propertyArr = [];
    let _self = this;

    if (jsonSchema != undefined) {
      Object.keys(jsonSchema).forEach(function (key) {
        let resultJson;
        _self.propertyArr.push(key);

        if (jsonSchema[key].type == 'array') {
          resultJson = _self.nastedJsonSep(jsonSchema, key, jsonFields.definitions[_self.jsonTitle]);
        } else if (jsonSchema[key].type == 'object') {
          resultJson = _self.objectJsonSchema(jsonSchema, key, jsonFields.definitions[_self.jsonTitle]);
        } else {
          resultJson = _self.plainJson(jsonSchema, key, jsonFields.definitions[_self.jsonTitle]);
        }

        _self.myForm['components'].push(resultJson);

      });

      // for (let j = 0; j < jsonFields.definitions[this.jsonTitle].required.length; j++) {
      //   this.options.disabled.push(jsonFields.definitions[this.jsonTitle].required[j]);
      // }
    } else {
      this.myForm['components'] = [];
    }
  }

  nastedJsonSep(jsonSchema, key, definationName) {
    if (jsonSchema[key].type == 'array') {
      if (jsonSchema[key].items.hasOwnProperty('properties')) {
        let containerJson = { components: [] };
        containerJson['label'] = key.charAt(0).toUpperCase() + key.slice(1);
        containerJson['input'] = true;
        containerJson['type'] = 'container';
        containerJson['key'] = key;

        let subProField = jsonSchema[key].items.properties;

        let _self = this;
        Object.keys(subProField).forEach(function (key1) {
          _self.propertyArr.push(key1);

          let tempField;

          if (subProField[key1].type == 'array') {
            tempField = _self.nastedJsonSep(subProField, key1, jsonSchema[key]);
          } else if (subProField[key1].type == 'object') {
            let tempField = _self.objectJsonSchema(subProField, key1, jsonSchema[key]);
          } else {
            tempField = _self.plainJson(subProField, key1, jsonSchema[key]);
          }
          containerJson['components'].push(tempField);
        });

        return containerJson;
      }
    }
  }

  objectJsonSchema(jsonSchema, key, definationName) {

    if (jsonSchema[key].type == 'object') {
      if (jsonSchema[key].hasOwnProperty('properties')) {
        let containerJson = { components: [] };
        containerJson['label'] = (jsonSchema[key].hasOwnProperty('properties')) ? jsonSchema[key].title : key.charAt(0).toUpperCase() + key.slice(1);
        containerJson['input'] = true;
        containerJson['type'] = 'container';
        containerJson['key'] = key;
        containerJson['required'] = jsonSchema[key].required;

        for (let j = 0; j < jsonSchema[key].required.length; j++) {
          this.options.disabled.push(jsonSchema[key].required[j]);
        }

        let subProField = jsonSchema[key].properties;

        let _self = this;
        Object.keys(subProField).forEach(function (key1) {
          _self.propertyArr.push(key1);

          let tempField;

          if (subProField[key1].type == 'array') {
            tempField = _self.nastedJsonSep(subProField, key1, jsonSchema[key]);
          } else if (subProField[key1].type == 'object') {
            let tempField = _self.objectJsonSchema(subProField, key1, jsonSchema[key]);
          } else {
            tempField = _self.plainJson(subProField, key1, jsonSchema[key]);
          }

          containerJson['components'].push(tempField);
        });

        return containerJson;
      }
    }
  }

  plainJson(jsonSchema, key, definationName) {

    var tempField = {};
    tempField['key'] = key;
    tempField['input'] = true;

    if (jsonSchema[key].hasOwnProperty('type')) {
      if (jsonSchema[key].type == 'string') {
        tempField['type'] = 'textfield';
        tempField['inputType'] = 'text';
      } else if (jsonSchema[key].type == 'number') {
        tempField['type'] = 'number';
      }

    }

    if (jsonSchema[key].hasOwnProperty('title')) {
      tempField['label'] = jsonSchema[key].title;
    } else {
      tempField['label'] = key.charAt(0).toUpperCase() + key.slice(1);
    }


    if (definationName.hasOwnProperty('required') && definationName.required.includes(key)) {
      tempField['validate'] = {
        "required": true
      };
    }

    if (jsonSchema[key].hasOwnProperty('format') && jsonSchema[key].format == 'date') {
      tempField['type'] = 'datetime';
      tempField['enableDate'] = true;
      tempField['enableTime'] = false;
    }

    return tempField;
  }

  onChange(event) {

    if (event.type == 'saveComponent' || event.type == "addComponent" || event.type == 'deleteComponent') {
      console.log(event.form.components);
      this.jsonFields.definitions[this.jsonTitle].required = [];

      let tempField = this.formioJsonToPlainJSONSchema(event, event.form.components, this.jsonFields.definitions[this.jsonTitle]);


      this.jsonFields.definitions[this.jsonTitle].properties = tempField;
      if(typeof(this.vcFields) == 'object'){
        this.updateCredentialTemp();
      }

      this.jsonEditor.set(this.jsonFields);
    }
  }

  updateCredentialTemp() {
    let certTmpJson = {};
    certTmpJson['type'] = (this.vcFields['credentialSubject'].hasOwnProperty('type') && this.vcFields['credentialSubject'] != '') ? this.vcFields['credentialSubject']['type'] : this.jsonFields.title;

    let _self = this;
    let propertyData = this.jsonFields.definitions[this.jsonFields.title].properties;
    let contextJson = {}
    contextJson[certTmpJson['type']] = {
      "@id": "https://github.com/sunbird-specs/vc-specs#" + certTmpJson['type'],
      "@context": {}
    }

    Object.keys(propertyData).forEach(function (key) {
      console.log({ key });


      if (propertyData[key].type == 'string' || propertyData[key].type == 'number') {
        certTmpJson[key] = "{{" + key + "}}";
        contextJson[certTmpJson['type']]['@context'][key] = "schema:Text";


      } else if (propertyData[key].type == 'object') {
        let objPro = propertyData[key].properties;
        Object.keys(objPro).forEach(function (key2) {
          console.log({ key2 });
          certTmpJson[key2] = "{{" + key + "." + key2 + "}}";
          contextJson[certTmpJson['type']]['@context'][key2] = "schema:Text";
        })
      }

    });


    let tempjson = this.vcFields
    this.vcFields = {
      '@context': [
        "https://www.w3.org/2018/credentials/v1",
        {
          '@context': {
            "@version": 1.1,
            "@protected": true,
          }
        }
      ],
      "issuer": "did:web:sunbirdrc.dev/vc/skill",
      "type": [
        "VerifiableCredential"
      ],
      "issuanceDate": "2021-08-27T10:57:57.237Z",
    };
    this.vcFields['credentialSubject'] = certTmpJson;
    this.vcFields["@context"][1]["@context"] = contextJson;

    this.vcEditor.set(this.vcFields);
  }

  showJson(event : any) {
    console.log(event);
    this.vcFields = JSON.parse(event.target.value);
    this.vcFieldsText = event.target.value;
  }

  updateJsonFields() {

    this.jsonFields = this.jsonEditor.get();
    this.jsonSchemaToFormioConvrt(this.jsonFields); 
    //this.jsonFields = JSON.parse(event.target.value);
   
  }

  saveAdvance() {
    this.jsonFields = this.jsonEditor.get();
    this.jsonEditor['_data']['_osConfig']['credentialTemplate'] = this.vcFields;
    this.newItemEvent.emit(this.jsonEditor);
  }

  checkValidate(element, tempFjson){
    if (element.hasOwnProperty('validate') && element.validate.minLength) {
      tempFjson[element.key].minLength = element.validate.minLength;
    }

    if (element.hasOwnProperty('validate') && element.validate.maxLength) {
      tempFjson[element.key].maxLength = element.validate.maxLength;
    }
    if(element.hasOwnProperty('validate') && element.validate.customMessage){
         tempFjson[element.key]['customMessage'] = element.validate.customMessage
      }
      if(element.hasOwnProperty('validate') && element.validate.pattern){
        tempFjson[element.key]['pattern'] = element.validate.pattern
     }
    return tempFjson;
  } 

  formioJsonToPlainJSONSchema(event, components, jsonDefination) {
    let tempFjson = {};
    this.jsonFields["_osConfig"]['uiConfig'] = [];

    components.forEach(element => {

      if ((event.type == "addComponent" || event.type == 'saveComponent') && !this.propertyArr.includes(element.key)) {
        let temp = element.label.replaceAll(/\s/g, '');

        element.key = temp.charAt(0).toLowerCase() + temp.slice(1);
       
        if (element.type == 'container') {
          jsonDefination.properties[element.key] = { 'type': 'object' };
        }
      }
   
      tempFjson[element.key] = this.signleFieldData(element);
      if (element.hasOwnProperty('validate') && element.validate.required == true) {
        this.jsonFields.definitions[this.jsonTitle].required.push(element.key);
      }
      if (element.hasOwnProperty('unique') && element.unique == true) {
        this.jsonFields["_osConfig"]["uniqueIndexFields"].push(element.key);
      //  this.jsonFields["status"] = "PUBLISHED"
      }
      
        this.jsonFields["_osConfig"]["uiConfig"].push({
          'key' : element.key,
          'title' : element.label
        });
      //  this.jsonFields["status"] = "PUBLISHED"
      


      tempFjson = this.checkValidate(element, tempFjson);
    
      if (element.type == 'container') {

        let containerType = jsonDefination.properties[element.key].type;
        if (containerType == 'object') {
          tempFjson[element.key] = this.objectTypeFieldData(event, element);
        } else {
          tempFjson[element.key] = this.arrayTypeFieldData(element);
        }

      } if (element.type == 'select') {

        let enumArr = [];

        for(let i = 0; i<  element['data']['values'].length; i++)
        {
            enumArr.push( element['data']['values'][i]['label'])
        }

        tempFjson[element.key] = {
          "type": "string",
          "title": element.label,
          "enum" : enumArr,
          "fieldType": "select"
          // "widget": {
          //   "formlyConfig": {
          //     "type": "enum",
          //     "templateOptions": {
          //       "options": element['data']['values']
          //     }
          //   }
          // }
        }
        console.log({ tempFjson });
      }
      if (element.type == 'checkbox') {
        tempFjson[element.key] = {
          "type": "boolean",
          "title": element.label,
          "default": false
        }
      } if (element.type == 'selectboxes') {
        tempFjson[element.key] = {
          type: 'select',
          templateOptions: {
            label: element.label,
            multiple: true,
            options: element['values']
          }
          //   tempFjson[element.key] = {
          //     "type": "array",
          //   "title": element.label,
          //   "uniqueItems": true,
          //   "items": {
          //     "type": "string",
          //     "enum": element['values']
          //   }
          // }
        }
      } if (element.type == 'radio') {
        /*  tempFjson[element.key] = {
            "type": "radio",
            "title": element.label,
            "templateOptions": {
              "options": element['values']
            }
          }*/

        tempFjson[element.key] = {
          "enum": element['values'],
          "title": element.label,
          "widget": {
            "formlyConfig": {
              "type": "radio"
            }
          }
        }
      }
    });
    return tempFjson;
  }

  objectTypeFieldData(event, jsonObj) {

    let fieldContainer = {
      "type": "object",
      "properties": {},
      "required": [],
    }

    fieldContainer['label'] = jsonObj.label;
    fieldContainer['input'] = true;

    if (jsonObj.hasOwnProperty('components') && jsonObj.components.length) {
      jsonObj.components.forEach(element => {

        if ((event.type == "addComponent" || event.type == 'saveComponent') && !this.propertyArr.includes(element.key)) {
          let temp = element.label.replaceAll(/\s/g, '');

          element.key = temp.charAt(0).toLowerCase() + temp.slice(1);

        }

        if (element.type == 'container') {

          let containerType = jsonObj.components[element.key].type;
          if (containerType == 'object') {
            fieldContainer.properties[element.key] = this.objectTypeFieldData(event, element);
          } else {
            fieldContainer.properties[element.key] = this.arrayTypeFieldData(element);
          }


        } else {
          fieldContainer.properties[element.key] = this.signleFieldData(element);
          if (element.hasOwnProperty('validate') && element.validate.required == true) {
            fieldContainer['required'].push(element.key);
          }
        }
      });
    }

    return fieldContainer;

  }

  arrayTypeFieldData(arrayJson) {

    let fieldContainer = {
      "type": "array",
      "title": arrayJson.label,
      "items": {
        "type": "object",
        "properties": {},
        "required": [],
      }
    }

    if (arrayJson.hasOwnProperty('components') && arrayJson.components.length) {
      arrayJson.components.forEach(element => {
        if (element.type == 'container') {

          let containerType = arrayJson.components[element.key].type;
          if (containerType == 'object') {
            fieldContainer.items.properties[element.key] = this.objectTypeFieldData(event, element);
          } else {
            fieldContainer.items.properties[element.key] = this.arrayTypeFieldData(element);
          }


        } else {
          fieldContainer.items.properties[element.key] = this.signleFieldData(element);
          if (element.hasOwnProperty('validate') && element.validate.required == true) {
            fieldContainer.items['required'].push(element.key);
          }
        }
      });
    }

    return fieldContainer;
  }


  signleFieldData(fieldObj) {
    let tempFjson = {};

    let fType = (fieldObj.type == 'number') ? 'number' : 'string';
    tempFjson[fieldObj.key] = {
      'type': fType
    };

    if (fieldObj.label) {
      tempFjson[fieldObj.key]['title'] = fieldObj.label
    }

    if (fieldObj.hasOwnProperty('placeholder')) {
      tempFjson[fieldObj.key]['placeholder'] = fieldObj.placeholder
    }

    if (fieldObj.hasOwnProperty('description')) {
      tempFjson[fieldObj.key]['description'] = fieldObj.description
    }
    
    tempFjson = this.checkValidate(fieldObj, tempFjson);
    
    if (fieldObj.type == 'datetime') {
      tempFjson[fieldObj.key]['format'] = 'date'
    }

    return tempFjson[fieldObj.key];

  }

  
  onDeleteComponent(e) {
  }

  onSubmit(event) { }


}
