import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';

export interface Post {
  User: string;
  Activity: string;
  FromNumber: string;
  Timestamp: number;
}
@Component({
  selector: 'app-topnavbar',
  templateUrl: './topnavbar.component.html',
  styleUrls: ['./topnavbar.component.css']
})
export class TopnavbarComponent implements OnInit {
  postsCol: AngularFirestoreCollection<Post>;
  posts: Observable<Post[]>;

  constructor(private afs: AngularFirestore,private auth: AuthService, private router: Router) { }

  ngOnInit() {

    this.posts = this.afs.collection<Post>('callrecords', ref => ref.where('Activity', '==', 'Missed')).valueChanges();
  }
  signout(){
   // this.router.navigate(['/']);
    this.auth.logout();
  }
}
