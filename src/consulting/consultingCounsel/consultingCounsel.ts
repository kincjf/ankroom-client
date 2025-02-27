/**
 * Created by insu on 2016-08-29.
 */
import { Component } from '@angular/core';
import { Router, ROUTER_DIRECTIVES } from '@angular/router';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http } from '@angular/http';
import { contentHeaders} from '../../common/headers';
import { config } from '../../common/config';


const template = require('./consultingCounsel.html');

@Component({
  selector: 'consultingCounsel',
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES ],
  template: template
})

/*
 Component 역할 :  컨설팅 정보를 입력
 작업상황 :
 - 다음 우편 API 사용하여 주소 입력 받기(완료)
 차후 개선방안 :
 - 선호 업체 자동입력 구현
 - UI개선
 */

export class ConsultingCounsel{
  jwt:string;
  public decodedJwt: any;
  lived: string;
  havePrefBizMember: boolean;


  constructor(public router: Router, public http: Http) {
    this.jwt = localStorage.getItem('id_token');//login시 저장된 jwt값 가져오기
    this.decodedJwt = this.jwt && window.jwt_decode(this.jwt);//jwt값 decoding
    contentHeaders.set('Authorization', this.jwt);//Header에 jwt값 추가하기

    this.havePrefBizMember = false;
  }


  //컨설팅 정보입력을 위한 함수이다.
  //제목, 선호업체명, 선호시공사례, 작성자성함, 연락처, 이메일, 예상 공사예산, 공사지 주소, 거주여부, 예상공사면적, 예상공사예정일, 방문상담희망일, 공사요청사항
  consultingRegister(event, title, buildType, userName, telephone, email, expectBuildPrice, buildPlace, buildPostCode, buildPlaceDetail, expectBuildTotalArea, expectBuildStartDate, expectConsultDate, reqContents){
    event.preventDefault();
    //lived에 들어갈 radio버튼에서 체크된 값 가져오기
    var lived 		= $(':radio[name="optionsRadios"]:checked').val();
    //우편번호, 주소, 상세주소를 JSON string로 변환하여 저장
    buildPlace = JSON.stringify([buildPostCode, buildPlace, buildPlaceDetail]);
    //html받은 값들을 json형식으로 저장
    let body= JSON.stringify({title, buildType, userName, telephone, email, expectBuildPrice, buildPlace, lived, expectBuildTotalArea, expectBuildStartDate, expectConsultDate, reqContents});

    let URL = [config.serverHost, config.path.consulting].join('/');

    this.http.post(URL, body, {headers: contentHeaders})
      .subscribe(
        response=>{
          //서버로부터 응답을 받은 후 내 컨설팅정보 조회로 이동
          alert("상담 등록 완료");
          this.router.navigate(['/consultingMyListInfo']);
        },
        error => {
          //서버로부터 응답 실패시 경고창
          alert(error.text());
          console.log(error.text());
        }
      )
  }

}
