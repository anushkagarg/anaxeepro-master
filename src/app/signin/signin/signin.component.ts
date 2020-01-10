
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

    email: string;
    password: any;
    responseMessage = '';
    responseMessageType= '';
    
  constructor(private authService: AuthService, private router: Router) { }

  showMessage(type, msg) {
    console.log('called');
    this.responseMessageType = type;
    this.responseMessage = msg;
    setTimeout(() => {
      this.responseMessage = '';
    }, 2000);
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle()
    .then((res) => {
        this.router.navigate(['userhome']);
      })
    .catch((err) => console.log(err));
  }

  signInWithEmail() {
     this.authService.signInRegular(this.email, this.password)
      .then((res) => {
        console.log(res);
        this.showMessage('success', 'Successfully Logged In!');
        this.router.navigate(['dashboard']);
     })
     .catch((err) =>
    // console.log('error: ' + err)
     this.showMessage('danger', err.message));
  // }
}
logout(){
  this.authService.logout();
}
isLoggedIn(){
  return this.authService.isLoggedIn();
}
  ngOnInit() {
  }

}



