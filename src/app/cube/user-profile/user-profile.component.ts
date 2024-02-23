import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { AuthService } from 'app/core/auth-module/auth.service';
import { ProfileService } from 'app/core/user-module/profiles.service';
@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit {
  loading: boolean;
  subscription: ISubscription;
  user: any;
  isUser = false;
  // Array of users learning objects
  allUserContributions = [];

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private profileService: ProfileService,
  ) { }

  async ngOnInit() {
    // Subscribe to data returned from profile.resolver
    this.subscription = this.route.data.subscribe(async val => {
      // Toggle page loading
      this.loading = true;
      this.user = val.user;
      // Check if current user is on their profile
      this.isUser = this.user.username === this.auth.username;
      await this.initProfileData();
    });
  }

  /**
   * Method to retrieve the current user profile information
   */
  async initProfileData() {
    /**
     * Two service methods are being used here:
     *
     * @method getCollectionData returns an array of objects with cuid, collection, status, and version
     * @method fetchLearningObject returns an individual learning object based on cuid
     * @fetchLearningObject is nested in order to load page elements concurrently while still performing acynchronous operations.
     */
    await this.profileService
      .getCollectionData(this.user.username).then(async (collectionMeta) => {
        const tempObjects = [];
        // Await each learning object for a users profile
        const promises = collectionMeta.map(async (objectMeta) => {
          const params = {
            author: undefined,
            cuid: objectMeta.cuid
          };
          // Return a promise for the current learning object
          return await this.profileService.fetchLearningObject(params);
        });
        // Resolve all calls to retrieve a learning object
        await Promise.allSettled(promises).then(promise => {
          promise.map(p => {
            if (p.status === 'fulfilled') {
              tempObjects.push(p.value);
            }
          });
        });
        // Users Learning Objects
        this.allUserContributions = tempObjects;
        // Toggle off loading profile
        this.loading = false;
      });
  }
}
