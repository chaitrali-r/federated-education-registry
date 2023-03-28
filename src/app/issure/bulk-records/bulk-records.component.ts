import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general/general.service';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-bulk-records',
  templateUrl: './bulk-records.component.html',
  styleUrls: ['./bulk-records.component.scss']
})
export class BulkRecordsComponent implements OnInit {
  headerName: string = 'plain';
  pdfName: any;
  osid: string;
  schemaObj;
  tempObj: any;
  nameArray = [];
  nameArray2;
  constructor(public router: Router, public route: ActivatedRoute,
    public generalService: GeneralService, private http: HttpClient,
    private config: AppConfig){
      this.osid = this.route.snapshot.paramMap.get('osid'); 
    }
  ngOnInit(): void {
   
   

    console.log(this.osid);

    
    this.generalService.getData('/Schema/' + this.osid).subscribe((res) => {
     console.log(res);
     this.schemaObj = JSON.parse(res.schema);
     this.tempObj = this.schemaObj.definitions.ScholarshipForTopClassStudents.properties;
       console.log(this.tempObj);
       Object.values(this.tempObj).forEach(entry => {
         console.log(entry['title']);
         this.nameArray.push(entry['title']); 
       });
     
     console.log(this.nameArray);
     this.nameArray2 = this.nameArray.join();
     console.log(this.nameArray2);
      // this.downloadCSV(this.nameArray2);
     }, err=>{
       
       console.log(err);
     });
    
  }

}
