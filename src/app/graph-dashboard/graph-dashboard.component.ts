import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-graph-dashboard',
  templateUrl: './graph-dashboard.component.html',
  styleUrls: ['./graph-dashboard.component.scss']
})
export class GraphDashboardComponent implements OnInit {
  url: string = "https://sunbirdrc-sandbox.xiv.in/public/dashboards/awFMgbKLfOMzN1wlNcHRvIU9aWSzAV7aysMjBZcI?org_slug=default";
  urlSafe: SafeResourceUrl;
  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

  }

}
