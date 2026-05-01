declare module "react-big-calendar/lib/addons/dragAndDrop" {
  import { CalendarProps } from "react-big-calendar";
  import { ComponentType } from "react";
  
  export interface withDragAndDropProps {
    onEventDrop?: (args: any) => void;
    onEventResize?: (args: any) => void;
    resizable?: boolean;
    selectable?: boolean;
  }

  export default function withDragAndDrop<TEvent extends object = object>(
    calendar: ComponentType<CalendarProps>
  ): ComponentType<CalendarProps & withDragAndDropProps>;
}

declare module "react-big-calendar" {
  import { ComponentType, ReactNode } from "react";

  export type View = "month" | "week" | "day" | "agenda";

  export interface Event {
    id?: string | number;
    title: ReactNode;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
    status?: string;
    contactId?: string;
    [key: string]: any;
  }

  export interface SlotInfo {
    start: Date;
    end: Date;
    slots: Date[];
    action: "select" | "click" | "doubleClick";
    resourceId?: string | number;
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    startAccessor: string | ((event: Event) => Date);
    endAccessor: string | ((event: Event) => Date);
    style?: React.CSSProperties;
    className?: string;
    view?: View;
    views?: View[];
    step?: number;
    timeslots?: number;
    selectable?: boolean;
    onSelectEvent?: (event: Event, e: React.SyntheticEvent) => void;
    onSelectSlot?: (slotInfo: SlotInfo) => void;
    onNavigate?: (date: Date, view: View, action?: string) => void;
    onView?: (view: View) => void;
    onDrillDown?: (date: Date, view?: View) => void;
    date?: Date;
    defaultDate?: Date;
    defaultView?: View;
    eventPropGetter?: (
      event: Event,
      start: Date,
      end: Date,
      isSelected?: boolean
    ) => { style?: React.CSSProperties; className?: string };
    messages?: {
      date?: string;
      time?: string;
      event?: string;
      showMore?: (count: number) => string;
      today?: string;
      month?: string;
      week?: string;
      day?: string;
      agenda?: string;
    };
    components?: any;
    formats?: any;
    titleAccessor?: string | ((event: Event) => ReactNode);
    tooltipAccessor?: string | ((event: Event) => ReactNode);
    allDayAccessor?: string | ((event: Event) => boolean);
  }

  const Calendar: ComponentType<CalendarProps>;
  export { Calendar };

  export function dateFnsLocalizer(config: {
    format: (date: Date, format: string, options?: any) => string;
    parse: (value: string, format: string, referenceDate: Date, options?: any) => Date;
    startOfWeek: (date: Date, options?: any) => Date;
    getDay: (date: Date, options?: any) => number;
    locales: Record<string, any>;
  }): any;
}