import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  name = "Sean Donnelly";
  employer = "Towson University";
  contributor = false;

  constructor() {
    /* interface User {
      String name;
      String[] affiliations;
      LearningObject[] objectsCreated;
      LearningObject[] objectsDownloaded;
      boolean contributor = false;
      //BufferedImage profilePic;
      //String userName; //for url?
      //String bio;
    
      public String getName();
      public String[] getAffils();
      public LearningObject[] getCreated();
      public LearningObject[] getDownloaded();
      public Boolean isContributor();
      //public String getBio();
      //public BufferedImage getPic();
      public void setName(String newName); //at very least should be able to change last name
      public void addAffils(String[] newAffils);
      public void remAffils(String[] badAffils);
      public void setContrib(); //would only ever need to change false to true
      //public void setBio(String newBio);
      //public void setPic(BufferedImage newPic);
    } */
   }

  ngOnInit() {
  }

}
