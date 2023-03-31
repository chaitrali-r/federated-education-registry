import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'app-keycloaklogin',
  templateUrl: './keycloaklogin.component.html',
  styleUrls: ['./keycloaklogin.component.css']
})
export class KeycloakloginComponent implements OnInit {
  user : any;
  entity: string;
  profileUrl: string  = '';
  constructor(
    public keycloakService: KeycloakService,
    public router: Router, private config: AppConfig

  ) { }

  ngOnInit(): void {
    this.keycloakService.loadUserProfile().then((res)=>{
      console.log(res['attributes'].entity[0]);

      this.entity = res['attributes'].entity[0];
      if(res['attributes'].hasOwnProperty('locale') && res['attributes'].locale.length){
        localStorage.setItem('setLanguage', res['attributes'].locale[0]);
      }
    });
    this.user = this.keycloakService.getUsername();
    this.keycloakService.getToken().then((token)=>{
      console.log('keyCloak teacher token - ', token);
      localStorage.setItem('token', token);
      localStorage.setItem('entity', this.entity);
      localStorage.setItem('loggedInUser', this.user);
      console.log('---------',this.config.getEnv('appType'))
      if(this.config.getEnv('appType') && this.config.getEnv('appType') === 'digital_wallet'){
        this.profileUrl = this.entity+'/documents'
      }if(this.entity === 'issue' || this.entity === 'Issuer'){
        this.profileUrl = '/dashboard';
      }else{
       // this.profileUrl = '/profile/'+this.entity;
       if(this.entity.includes('student') || this.entity.includes('teacher') || this.entity.includes('institute'))
       {
        this.profileUrl = '/profile/'+this.entity;
       }else{
        this.profileUrl = '/student/attestation/verifiable-credential';

       }
      }
      this.router.navigate([this.profileUrl]);

    });
  }


}
