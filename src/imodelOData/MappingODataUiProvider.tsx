/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { StagePanelLocation, StagePanelSection, UiItemsProvider, Widget } from "@itwin/appui-react";
import React from "react";
import { MappingOData } from "./MappingOData";

export class MappingODataUiProvider implements UiItemsProvider {
  public readonly id = "ODataWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection
  ): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];

    if (
      location === StagePanelLocation.Bottom &&
      section === StagePanelSection.Start
    ) {
      const odataWidget: Widget = {
        id: "MappingOData",
        label: "Mapping OData",
        content: <MappingOData />,
      };

      widgets.push(odataWidget);
    }

    return widgets;
  }
}
