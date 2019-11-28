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
  public userDetails: firebase.User = undefined;
  // tslint:disable-next-line:variable-name
  constructor(private _firebaseAuth: AngularFireAuth, private router: Router) {
        this.user = _firebaseAuth.authState;

        this.user.subscribe(
          (user) => {
            if (user) {
              this.userDetails = user;
              console.log(this.userDetails.email, this.isLoggedIn());
            } else {
              this.userDetails = undefined;
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
if (this.userDetails ) {
    return true;
  } else {
    return false;
  }
}

logout() {
  this._firebaseAuth.auth.signOut()
  .then((res) => this.router.navigate(['/']));
}
}
