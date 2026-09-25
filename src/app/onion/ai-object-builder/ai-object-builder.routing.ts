import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AiObjectBuilderComponent } from "./ai-object-builder.component";

const routes: Routes = [
    {
        path: "",
        component: AiObjectBuilderComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AiObjectBuilderRoutingModule {}
