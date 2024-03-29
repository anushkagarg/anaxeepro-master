import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user: Observable<firebase.User>;
 // public userDetails: firebase.User = undefined;
  public userDetails: firebase.User = null;
  // tslint:disable-next-line:variable-name
  constructor(private _firebaseAuth: AngularFireAuth, private router: Router) {
        this.user = _firebaseAuth.authState;

        this.user.subscribe(
          (user) => {
            if (user) {
              this.userDetails = user;
              console.log(this.userDetails.email, this.isLoggedIn());
            } else {
              // this.userDetails = undefined;
              this.userDetails = null;
            }
          }
        );
}
signInWithGoogle() {
  return this._firebaseAuth.auth.signInWithPopup(
    new firebase.auth.GoogleAuthProvider()
  );
}

signInRegular(email, password) {
  const credential = firebase.auth.EmailAuthProvider.credential( email, password);
  return this._firebaseAuth.auth.signInWithEmailAndPassword(email, password);
}


isLoggedIn() {
if (this.userDetails == null ) {
    return false;
  } else {
    return true;
  }
}

logout() {
  this._firebaseAuth.auth.signOut()
  .then((res) => this.router.navigate(['/']));
}
}
