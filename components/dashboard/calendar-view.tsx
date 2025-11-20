"use client";

import React, { useMemo, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { ContentItem, ContentStatus } from "@/lib/content-data";
import { Youtube, Twitter } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  resource: ContentItem;
}

interface CalendarViewProps {
  items: ContentItem[];
  onTitleUpdate: (id: string, newTitle: string) => void;
  onDateUpdate: (id: string, newDate: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ContentStatus) => void;
}

export function CalendarView({
  items,
  onTitleUpdate,
  onDateUpdate,
  onDelete,
  onStatusChange,
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const events: CalendarEvent[] = useMemo(() => {
    return items
      .filter((item) => item.scheduledFor || item.status === "published")
      .map((item) => {
        const date = item.scheduledFor
          ? new Date(item.scheduledFor)
          : new Date(item.createdAt);

        return {
          title: item.title,
          start: date,
          end: date,
          resource: item,
        };
      });
  }, [items]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setEditTitle(event.resource.title);
  };

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    // Handle creating new event or moving event to this date
    console.log("Selected slot:", start);
  };

  const handleSaveEdit = () => {
    if (selectedEvent && editTitle.trim()) {
      onTitleUpdate(selectedEvent.id, editTitle.trim());
      setSelectedEvent(null);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const item = event.resource;
    let backgroundColor = "#3b82f6"; // default blue

    if (item.platform === "youtube") {
      backgroundColor = "#ef4444"; // red
    } else if (item.platform === "x") {
      backgroundColor = "#3b82f6"; // blue
    }

    if (item.status === "published") {
      backgroundColor = "#22c55e"; // green
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  return (
    <>
      <div className="h-[calc(100vh-200px)] bg-card rounded-xl p-4 border border-border calendar-container">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          selectable
          views={["month", "week", "day"]}
          defaultView="month"
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.platform === "youtube" ? (
                <Youtube className="w-5 h-5 text-red-500" />
              ) : (
                <Twitter className="w-5 h-5 text-blue-400" />
              )}
              Edit Content
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedEvent?.platform === "youtube" ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Video title..."
                className="text-sm"
              />
            ) : (
              <Textarea
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Tweet text..."
                className="text-sm min-h-[100px]"
                maxLength={280}
              />
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {selectedEvent?.scheduledFor
                  ? `Scheduled: ${new Date(selectedEvent.scheduledFor).toLocaleDateString()}`
                  : `Created: ${new Date(selectedEvent?.createdAt || "").toLocaleDateString()}`}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                className="flex-1"
                disabled={!editTitle.trim()}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <Button
              onClick={() => {
                if (selectedEvent) {
                  onDelete(selectedEvent.id);
                  setSelectedEvent(null);
                }
              }}
              variant="destructive"
              className="w-full"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .calendar-container .rbc-calendar {
          font-family: inherit;
          color: var(--foreground);
        }
        .calendar-container .rbc-header {
          background-color: var(--card);
          border-color: var(--border);
          color: var(--foreground);
          padding: 10px 3px;
          font-weight: 500;
        }
        .calendar-container .rbc-month-view {
          border-color: var(--border);
          background-color: var(--background);
        }
        .calendar-container .rbc-day-bg {
          border-color: var(--border);
        }
        .calendar-container .rbc-today {
          background-color: var(--accent);
        }
        .calendar-container .rbc-off-range-bg {
          background-color: var(--muted);
        }
        .calendar-container .rbc-date-cell {
          padding: 4px 8px;
          color: var(--foreground);
        }
        .calendar-container .rbc-event {
          padding: 2px 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .calendar-container .rbc-event:hover {
          opacity: 1;
        }
        .calendar-container .rbc-toolbar {
          margin-bottom: 16px;
        }
        .calendar-container .rbc-toolbar button {
          color: var(--foreground);
          border-color: var(--border);
          background-color: var(--card);
          padding: 6px 12px;
          border-radius: 6px;
        }
        .calendar-container .rbc-toolbar button:hover {
          background-color: var(--accent);
        }
        .calendar-container .rbc-toolbar button.rbc-active {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
      `}</style>
    </>
  );
}

