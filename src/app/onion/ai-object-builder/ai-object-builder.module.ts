import { NgModule } from "@angular/core";

import { AiObjectBuilderComponent } from "./ai-object-builder.component";
import { AiObjectBuilderRoutingModule } from "./ai-object-builder.routing";

@NgModule({
    imports: [AiObjectBuilderRoutingModule, AiObjectBuilderComponent],
})
export class AiObjectBuilderModule {}
