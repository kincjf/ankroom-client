import { Component } from '@angular/core';
import { Router, ROUTER_DIRECTIVES } from '@angular/router';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http } from '@angular/http';
import { contentHeaders } from '../../common/headers';
import { config } from '../../common/config';

const template = require('./businessSignup.html');

@Component({
  selector: 'businessSignup',
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES ],
  template: template
})

export class BusinessSignup {
  constructor(public router: Router, public http: Http) {
  }

  businesssignup(event, email, password, password_ok, memberType) {
    //html에서의 value값
    var passwords = password;
    var confirmpasswords = password_ok;

    if (passwords != confirmpasswords) {
      alert("비밀번호가 일치하지 않습니다");
    }//password 일치하는지 점검
    else {
      event.preventDefault();
      let body = JSON.stringify({ email, password,  memberType });

      let URL = [config.serverHost, config.path.signup].join('/');
      console.log("businessSignup URL : " + URL);
      //html받은 값들을 json형식으로 저장
      this.http.post(URL, body, { headers: contentHeaders })
        .subscribe(
          response => {
            this.router.navigate(['/login']);
            //서버로부터 응답 성공시 home으로 이동
          },
          error => {
            alert(error.text());
            console.log(error.text());
            //서버로부터 응답 실패시 경고창
          }
        );
    }
  }
}
