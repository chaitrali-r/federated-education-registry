import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { JSONSchema7 } from "json-schema";
import { GeneralService } from 'src/app/services/general/general.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { SchemaService } from '../../services/data/schema.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
@Component({
  selector: 'app-add-records',
  templateUrl: './add-records.component.html',
  styleUrls: ['./add-records.component.scss']
})
export class AddRecordsComponent implements OnInit {
  form2: FormGroup;
  model = {};
  schemaloaded = false;
  headerName: string = 'plain'

  options: FormlyFormOptions;
  fields: FormlyFieldConfig[];
  schema: JSONSchema7 = {
    "type": "object",
    "title": "",
    "definitions": {},
    "properties": {},
    "required": []
  };
  form: string;
  formSchema: any;
  responseData: any;
  definations: any;
  property: any;
  schemaName: any;
  item: any;
  fieldKey: any;
  fieldName;
  sitems: any;
   states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado']
  constructor(public schemaService: SchemaService,
    public toastMsg: ToastMessageService,
    public router: Router,
    private route: ActivatedRoute,
    private formlyJsonschema: FormlyJsonschema,
    public generalService: GeneralService,
    public http: HttpClient) {
    this.schemaName = this.route.snapshot.paramMap.get('document');

  }

  ngOnInit(): void {

    this.searchStudent();

   /* this.schemaService.getSchemas().subscribe((res) => {
      this.responseData = res;

      this.definations = this.responseData.definitions;
      this.property = this.definations[this.schemaName].properties;


      this.schema["type"] = "object";
      //  this.schema["title"] = this.formSchema.title;
      this.schema["definitions"] = this.definations;
      this.schema["properties"] = this.property;
      this.schema["required"] = this.definations[this.schemaName].required;

      this.loadSchema();

    });*/

    this.generalService.getData('Schema').subscribe((res) => {
      console.log(JSON.parse(res[0].schema));
      this.responseData = JSON.parse(res[0].schema);

      this.definations = this.responseData.definitions;
      this.property = this.definations[this.schemaName].properties;


      this.schema["type"] = "object";
      //  this.schema["title"] = this.formSchema.title;
      this.schema["definitions"] = this.definations;
      this.schema["properties"] = this.property;
      this.schema["required"] = this.definations[this.schemaName].required;

      this.loadSchema();
      
    });


  }

  loadSchema() {
    this.form2 = new FormGroup({});
    this.options = {};
    this.fields = [this.formlyJsonschema.toFieldConfig(this.schema)];
    let tempFields = [];

    this.fields[0].fieldGroup.forEach((fieldObj, index) => {
      console.log({ fieldObj });
      this.fieldName = fieldObj.key;
      tempFields[index] = this.formBuildingSingleField(fieldObj, this.fields[0].fieldGroup[index], this.schema);

      if (fieldObj.type == 'object') {

        tempFields[index]['templateOptions']['label'] = fieldObj.hasOwnProperty('label') ? fieldObj['label'] : undefined;
        tempFields[index]['templateOptions']['description'] = fieldObj.hasOwnProperty('description') ? fieldObj['description'] : undefined;

        if (fieldObj.hasOwnProperty('label')) {
          tempFields[index]['wrappers'] = ['panel'];
        }

        fieldObj.fieldGroup.forEach((sfieldObj, sIndex) => {
          fieldObj.fieldGroup[sIndex] = this.formBuildingSingleField(sfieldObj, fieldObj.fieldGroup[sIndex], this.schema['properties'][this.fieldName]);
        });
        tempFields[index]['type'] = '';
        tempFields[index]['fieldGroup'] = fieldObj.fieldGroup
        // this.schema.properties[this.fieldKey]['required'].includes();



        

      }
      else if (fieldObj.type == 'array') {
      }
    });


    this.fields[0].fieldGroup = tempFields;

    console.log(tempFields);

    this.schemaloaded = true;
  }

  formBuildingSingleField(fieldObj, fieldSchena, requiredF) {

    this.fieldKey = fieldObj.key;
    let tempObj = fieldSchena;

    if(fieldObj.key == 'studentName')
        {
         // tempObj['type'] = 'autocomplete';
console.log(this.states)
          tempObj['templateOptions']['filter'] = (term) => of(term ? this.filterStates(term) : this.states.slice())
        
        
        
          // tempObj['type'] = "autocomplete";
          // tempObj['templateOptions']['label'] = 'fullName';
          // var dataval = "{{value}}"
          // tempObj['templateOptions']['search$'] = (term) => {
          //   if (term || term != '') {
          //     var datapath = this.findPath(field.autocomplete.body, dataval, '')
          //     this.setPathValue(field.autocomplete.body, datapath, term)
  
          //     dataval = term;
          //     this.generalService.postData(field.autocomplete.apiURL, field.autocomplete.body).subscribe(async (res) => {
          //       let items = res;
          //       items = items.filter(x => x[field.autocomplete.responseKey].toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
          //       if (items) {
          //         this.searchResult = items;
          //         return observableOf(this.searchResult);
          //       }
          //     });
          //   }
          //   return observableOf(this.searchResult);
          // }
        
        }

    if (!fieldObj['templateOptions'].hasOwnProperty('label') || fieldObj.templateOptions.label == undefined) {
      // let str: any = (fieldObj.templateOptions.label) ? fieldObj.templateOptions.label : fieldObj.key;


      //   let str: any = fieldObj.key;
      tempObj['templateOptions']['label'] = this.fieldKey.charAt(0).toUpperCase() + this.fieldKey.slice(1);

      if (requiredF.hasOwnProperty('required')) {
        if (requiredF.required.includes(this.fieldKey)) {
          tempObj['templateOptions']['required'] = true;
        }
      }

    } else {

      if (fieldObj.templateOptions.label == undefined) {
        // let str: any = fieldObj.key;
        tempObj['templateOptions']['label'] = this.fieldKey.charAt(0).toUpperCase() + this.fieldKey.slice(1);
      }
    }


    // if (requiredF.hasOwnProperty('required')) {
    //   if (requiredF.required.includes(this.fieldKey)) {
    //     tempObj['templateOptions']['required'] = true;
    //   }
    // }

    if (fieldObj.templateOptions['type'] == 'enum' || fieldObj.templateOptions.hasOwnProperty('options')) {
      tempObj['type'] = 'select';
      tempObj['templateOptions']['options'] = fieldObj.templateOptions.options;
    }

    if (this.property.hasOwnProperty(this.fieldKey) && this.property[this.fieldKey].hasOwnProperty('format')) {
      tempObj['templateOptions']['type'] = this.property[this.fieldKey].format;
    }

    if (this.property.hasOwnProperty(this.fieldKey) && this.property[this.fieldKey].hasOwnProperty('placeholder')) {
      tempObj['templateOptions']['placeholder'] = this.property[this.fieldKey].placeholder;
    }

    if (fieldObj['type'] == 'string' || fieldObj['type'] == 'number') {
      tempObj['type'] = 'input';
    }

    return tempObj;

    // this.fields[0].fieldGroup[0]['label'] = (fieldObj.name).toUpperCase();
  }

  submit() {
    console.log(this.model);
    this.generalService.postData('/NTSE', this.model).subscribe((res) => {

      this.router.navigate(['records/' + this.schemaName]);
    })
  }

  searchStudent(){

    var formData = {
      "filters": {
       
      },
      "limit": 20,
      "offset": 0
    }

    this.generalService.postData('/Student/search', formData).subscribe(async (res) => {
      this.sitems = res;
      console.log({res})
     
    });
  }

  filterStates(name: string) {
    return this.states.filter(state =>
      state.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }


  findPath = (obj, value, path) => {
    if (typeof obj !== 'object') {
      return false;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var t = path;
        var v = obj[key];
        var newPath = path ? path.slice() : [];
        newPath.push(key);
        if (v === value) {
          return newPath;
        } else if (typeof v !== 'object') {
          newPath = t;
        }
        var res = this.findPath(v, value, newPath);
        if (res) {
          return res;
        }
      }
    }
    return false;
  }

}
