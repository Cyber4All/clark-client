import { Component, Input, OnInit } from "@angular/core";
import { UserService } from "app/core/user-module/user.service";
import { NgClass, NgIf, NgFor } from "@angular/common";
import { CuratorCardComponent } from "./curator-card/curator-card.component";

@Component({
    selector: "clark-curators",
    templateUrl: "./curators.component.html",
    styleUrls: ["./curators.component.scss"],
    standalone: true,
    imports: [NgClass, NgIf, NgFor, CuratorCardComponent],
})
export class CuratorsComponent implements OnInit {
    @Input() collectionName: string;
    curators: any;

    constructor(private userService: UserService) {}

    async ngOnInit(): Promise<void> {
        this.curators = await this.userService.searchUsers({
            accessGroups: [`curator@${this.collectionName}`],
        });
    }
}
