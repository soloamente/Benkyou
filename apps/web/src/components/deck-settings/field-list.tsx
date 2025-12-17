"use client";

import { useState } from "react";
import { type NoteTypeField } from "@/lib/deck-settings-api";

// Settings gear icon component
function IconGear({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.1667 12.5C16.0557 12.7513 16.0227 13.0302 16.0717 13.3005C16.1207 13.5708 16.2496 13.8203 16.4417 14.0167L16.4917 14.0667C16.6467 14.2215 16.7696 14.4053 16.8535 14.6076C16.9374 14.81 16.9805 15.027 16.9805 15.2458C16.9805 15.4647 16.9374 15.6817 16.8535 15.884C16.7696 16.0864 16.6467 16.2702 16.4917 16.425C16.3369 16.58 16.1531 16.7029 15.9507 16.7868C15.7484 16.8707 15.5314 16.9138 15.3125 16.9138C15.0937 16.9138 14.8767 16.8707 14.6743 16.7868C14.472 16.7029 14.2882 16.58 14.1333 16.425L14.0833 16.375C13.887 16.1829 13.6375 16.054 13.3672 16.005C13.0969 15.956 12.818 15.989 12.5667 16.1C12.3203 16.2056 12.1125 16.381 11.9676 16.6046C11.8227 16.8282 11.7473 17.0902 11.75 17.3583V17.5C11.75 17.942 11.5744 18.366 11.2618 18.6785C10.9493 18.9911 10.5253 19.1667 10.0833 19.1667C9.64131 19.1667 9.21738 18.9911 8.90482 18.6785C8.59226 18.366 8.41667 17.942 8.41667 17.5V17.425C8.41389 17.1492 8.32966 16.8811 8.17403 16.6549C8.01841 16.4288 7.79856 16.255 7.54167 16.1583C7.29037 16.0474 7.01149 16.0143 6.74116 16.0633C6.47083 16.1123 6.22128 16.2413 6.025 16.4333L5.975 16.4833C5.82016 16.6383 5.63638 16.7612 5.43405 16.8451C5.23171 16.929 5.0147 16.9721 4.79583 16.9721C4.57697 16.9721 4.35995 16.929 4.15762 16.8451C3.95528 16.7612 3.77151 16.6383 3.61667 16.4833C3.46169 16.3285 3.33877 16.1447 3.25488 15.9424C3.17099 15.74 3.12793 15.523 3.12793 15.3042C3.12793 15.0853 3.17099 14.8683 3.25488 14.666C3.33877 14.4636 3.46169 14.2798 3.61667 14.125L3.66667 14.075C3.85872 13.8787 3.98768 13.6292 4.03668 13.3589C4.08568 13.0885 4.05263 12.8097 3.94167 12.5583C3.83612 12.312 3.66072 12.1042 3.43712 11.9593C3.21352 11.8144 2.95155 11.7389 2.68333 11.7417H2.54167C2.09964 11.7417 1.67571 11.5661 1.36315 11.2535C1.05059 10.941 0.875 10.517 0.875 10.075C0.875 9.63297 1.05059 9.20905 1.36315 8.89649C1.67571 8.58393 2.09964 8.40833 2.54167 8.40833H2.61667C2.89246 8.40556 3.16057 8.32132 3.38672 8.1657C3.61287 8.01008 3.78667 7.79023 3.88333 7.53333C3.9943 7.28203 4.02734 7.00316 3.97834 6.73283C3.92934 6.4625 3.80039 6.21295 3.60833 6.01667L3.55833 5.96667C3.40336 5.81183 3.28043 5.62805 3.19654 5.42571C3.11266 5.22338 3.06959 5.00636 3.06959 4.7875C3.06959 4.56864 3.11266 4.35162 3.19654 4.14929C3.28043 3.94695 3.40336 3.76317 3.55833 3.60833C3.71317 3.45336 3.89695 3.33043 4.09929 3.24654C4.30162 3.16266 4.51864 3.11959 4.7375 3.11959C4.95636 3.11959 5.17338 3.16266 5.37571 3.24654C5.57805 3.33043 5.76183 3.45336 5.91667 3.60833L5.96667 3.65833C6.16295 3.85039 6.4125 3.97934 6.68283 4.02834C6.95316 4.07734 7.23203 4.0443 7.48333 3.93333H7.54167C7.78799 3.82779 7.99581 3.65239 8.14071 3.42879C8.2856 3.20519 8.36108 2.94321 8.35833 2.675V2.5C8.35833 2.05797 8.53393 1.63405 8.84649 1.32149C9.15905 1.00893 9.58297 0.833333 10.025 0.833333C10.467 0.833333 10.891 1.00893 11.2035 1.32149C11.5161 1.63405 11.6917 2.05797 11.6917 2.5V2.575C11.6889 2.84321 11.7644 3.10519 11.9093 3.32879C12.0542 3.55239 12.262 3.72779 12.5083 3.83333C12.7597 3.9443 13.0385 3.97734 13.3089 3.92834C13.5792 3.87934 13.8287 3.75039 14.025 3.55833L14.075 3.50833C14.2298 3.35336 14.4136 3.23043 14.616 3.14654C14.8183 3.06266 15.0353 3.01959 15.2542 3.01959C15.473 3.01959 15.6901 3.06266 15.8924 3.14654C16.0947 3.23043 16.2785 3.35336 16.4333 3.50833C16.5883 3.66317 16.7112 3.84695 16.7951 4.04929C16.879 4.25162 16.9221 4.46864 16.9221 4.6875C16.9221 4.90636 16.879 5.12338 16.7951 5.32571C16.7112 5.52805 16.5883 5.71183 16.4333 5.86667L16.3833 5.91667C16.1913 6.11295 16.0623 6.3625 16.0133 6.63283C15.9643 6.90316 15.9974 7.18203 16.1083 7.43333V7.5C16.2139 7.74631 16.3893 7.95414 16.6129 8.09904C16.8365 8.24393 17.0985 8.31941 17.3667 8.31667H17.5C17.942 8.31667 18.366 8.49226 18.6785 8.80482C18.9911 9.11738 19.1667 9.54131 19.1667 9.98333C19.1667 10.4254 18.9911 10.8493 18.6785 11.1618C18.366 11.4744 17.942 11.65 17.5 11.65H17.425C17.1568 11.6527 16.8948 11.7282 16.6712 11.8731C16.4476 12.018 16.2722 12.2258 16.1667 12.4722V12.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wavy line icon for inactive/hidden fields
function IconWavy({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="8"
      viewBox="0 0 16 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 4C1.5 2 2.5 1 4 1C6 1 6 7 8 7C10 7 10 1 12 1C13.5 1 14.5 2 15 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// X icon for removing fields
function IconX({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FieldListProps {
  fields: NoteTypeField[];
  onFieldsChange: (fields: NoteTypeField[]) => void;
  onAddField: () => void;
  onFieldSettings: (fieldIndex: number) => void;
  onRemoveField: (fieldIndex: number) => void;
}

export function FieldList({
  fields,
  onFieldsChange,
  onAddField,
  onFieldSettings,
  onRemoveField,
}: FieldListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder fields
    const newFields = [...fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);
    onFieldsChange(newFields);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Check if field is "inactive" (like Frequency in the design)
  const isFieldInactive = (field: NoteTypeField) => {
    return field.name === "Frequency" || field.type === "number";
  };

  return (
    <div className="flex flex-col gap-2.5 w-full h-full">
      <div className="flex flex-col gap-2.5 w-full h-full overflow-y-auto">
        {fields.map((field, index) => {
          const inactive = isFieldInactive(field);
          
          return (
            <div
              key={`${field.name}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                bg-card w-full justify-between flex h-fit items-center gap-5 rounded-4xl px-2.5 py-2.5 leading-none
                cursor-grab active:cursor-grabbing
                ${draggedIndex === index ? "opacity-50" : ""}
                ${inactive ? "opacity-40" : ""}
              `}
            >
              {/* Field info */}
              <div className="flex items-center gap-2.5">
                {/* Field number */}
                <div className="flex cursor-pointer rounded-full justify-center items-center bg-background px-2.5 py-1.75 h-[32px] w-[32px] leading-none text-sm">
                  {index + 1}
                </div>
                {/* Field name */}
                <span className={inactive ? "text-title-secondary" : ""}>
                  {field.name}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.25">
                {/* Inactive indicator */}
                {inactive && (
                  <div className="mr-2">
                    <IconWavy className="opacity-40" />
                  </div>
                )}
                {/* Settings button */}
                <button
                  onClick={() => onFieldSettings(index)}
                  className="flex cursor-pointer rounded-full items-center bg-background p-1.5 w-fit leading-none gap-3.75 hover:bg-background/80 transition-colors duration-200 ease"
                  aria-label={`Settings for ${field.name}`}
                >
                  <IconGear className="opacity-60" />
                </button>
                {/* Remove button */}
                <button
                  onClick={() => onRemoveField(index)}
                  className="flex cursor-pointer rounded-full items-center bg-background p-1.5 w-fit leading-none gap-3.75 hover:bg-red-500/20 transition-colors duration-200 ease"
                  aria-label={`Remove ${field.name}`}
                >
                  <IconX className="opacity-60" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add field button */}
        <button
          onClick={onAddField}
          className="bg-card/40 text-title-secondary cursor-pointer w-full justify-center flex h-fit items-center gap-5 rounded-4xl px-4.25 py-4.25 leading-none hover:bg-card/60 transition-colors duration-200 ease"
        >
          Add new field
        </button>
      </div>
    </div>
  );
}

