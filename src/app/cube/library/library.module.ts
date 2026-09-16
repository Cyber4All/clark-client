import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LibraryComponent } from "./library.component";
import { NotificationCardComponent } from "./components/notification-card/notification-card.component";
import { SharedModule } from "app/shared/shared.module";
import { PaginationComponent } from "./components/pagination/pagination.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    {
        path: "",
        component: LibraryComponent,
        data: { title: "Download History" },
    },
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        // root component
        LibraryComponent,
        NotificationCardComponent,
        PaginationComponent,
    ],
    exports: [PaginationComponent, RouterModule],
})
export class LibraryModule {}
