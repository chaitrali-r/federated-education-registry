import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bulk-records',
  templateUrl: './bulk-records.component.html',
  styleUrls: ['./bulk-records.component.scss']
})
export class BulkRecordsComponent implements OnInit {
  headerName: string = 'plain';
  constructor() { }

  ngOnInit(): void {

  }

}
