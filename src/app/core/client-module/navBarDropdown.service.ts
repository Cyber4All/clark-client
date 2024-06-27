import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Topic } from '../../../entity';
import { RelevancyService } from 'app/core/learning-object-module/relevancy/relevancy.service';


@Injectable({
    providedIn: 'root'
})
export class NavbarDropdownService {

    constructor(
        private router: Router,
        private relevancyService: RelevancyService
    ) { }
    //mobile or desktop
    public isDesktop = new BehaviorSubject<boolean>(true);
    //user options main navbar
    public userDropdown = new BehaviorSubject<boolean>(false);

    //DO NOT REMOVE
    // public levelsDropdown = new BehaviorSubject<boolean>(false);

    public topicDropdown = new BehaviorSubject<boolean>(false);
    public collectionsDropdown = new BehaviorSubject<boolean>(false);
    public resourcesDropdown = new BehaviorSubject<boolean>(false);
    public browseDropdown = new BehaviorSubject<boolean>(false);
    //mobile slideouts
    public isMHamburger = new BehaviorSubject<boolean>(false);
    public isMSearch = new BehaviorSubject<boolean>(false);

    public showNavbars = new BehaviorSubject<boolean>(true);

    public externalResources = [
    {name: 'Standard Guidelines', link: 'https://standard-guidelines.clark.center'},
    {name: 'Task Tool', link: 'https://tasktool.clark.center'},
    {name: 'CAE Community Site', link: 'https://www.caecommunity.org/'},
    {name: 'CPNC Competency Constructor', link: 'https://cybercompetencies.com'}
    ];
    public topics = new BehaviorSubject<Topic[]>([]);
    public topicSelection = new BehaviorSubject<Topic>({ _id: '', name: '' });

    async getTopicList(): Promise<void> {
        this.topics.next(await this.relevancyService.getTopics());
    }

    public setTopic(topic: Topic): void {
        this.closeAll();
        this.router.navigate(['/browse'], { queryParams: { currPage: 1, limit: 10, status: 'released', topics: topic } });
    }

    //close mobile slideouts
    public closeMobileMenus(): void {
        if (this.isMHamburger.getValue()) {
            this.isMHamburger.next(false);
        }
        if (this.isMSearch.getValue()) {
            this.isMSearch.next(false);
        }
    }

    //close all menus and dropdowns
    public closeAll(): void {
        if (this.isMHamburger.getValue()) {
            this.isMHamburger.next(false);
        }
        if (this.isMSearch.getValue()) {
            this.isMSearch.next(false);
        }
        if (this.userDropdown.getValue()) {
            this.userDropdown.next(false);
        }
        if (this.topicDropdown.getValue()) {
            this.topicDropdown.next(false);
        }
        if (this.collectionsDropdown.getValue()) {
            this.collectionsDropdown.next(false);
        }
        if (this.resourcesDropdown.getValue()) {
            this.resourcesDropdown.next(false);
        }
        if(this.browseDropdown.getValue()) {
            this.browseDropdown.next(false);
        }

    }

    public setNavbarStatus(): void {
        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                // if we're in onion, auth, or admin, toggle the navbars off
                this.closeMobileMenus();
                this.closeAll();
                const url = e.url.split('/');
                if (
                    url[1] === 'auth' ||
                    url[1] === 'onion' ||
                    url[1] === 'admin'
                ) {
                    this.toggleNavbars(false);
                } else {
                    this.toggleNavbars(true);
                };
            };
            window.scrollTo(0, 0);
        });
    }

    public toggleNavbars(val: boolean): void {
        this.showNavbars.next(val);
    }

    public toggleUserDropdown(): void {
        this.userDropdown.next(!this.userDropdown.getValue());
    }

    public toggleMobileHamburger(): void {
        this.isMHamburger.next(!this.isMHamburger.getValue());
    }

    public toggleMobileSearch(): void {
        this.isMSearch.next(!this.isMSearch.getValue());
    }
    //DO NOT REMOVE - refactor for future use
    // public toggleLevelsDropdown(): void {
    //     this.levelsDropdown.next(!this.levelsDropdown.getValue());
    // }

    public toggleTopicDropdown(): void {
        this.topicDropdown.next(!this.topicDropdown.getValue());
    }

    public toggleCollectionDropdown(): void {
        this.collectionsDropdown.next(!this.collectionsDropdown.getValue());
    }

    public toggleResourcesDropdown(): void {
        this.resourcesDropdown.next(!this.resourcesDropdown.getValue());
    }

    public toggleBrowseDropdown(): void {
        this.browseDropdown.next(!this.browseDropdown.getValue());
    }

    public linkOut(link: string): void {
        window.open(link);
    }
}
