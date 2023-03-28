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

  updateLabel(input) {
    var label = document.getElementById("file-label");
    if (input.files.length > 0) {
      label.textContent = input.files[0].name;
    } else {
      label.textContent = "Browse File";
    }
  }
  

}
