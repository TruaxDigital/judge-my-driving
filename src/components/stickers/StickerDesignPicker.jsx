import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

const DESIGNS = [
  { id: 'company_vehicle', label: 'Company Vehicle' },
  { id: 'decades_behind_wheel', label: 'Decades Behind the Wheel' },
  { id: 'experienced_driver', label: 'Experienced Driver' },
  { id: 'go_easy_new', label: "Go Easy, I'm New" },
  { id: 'tell_my_boss', label: 'Tell My Boss' },
  { id: 'tell_my_dad', label: 'Tell My Dad' },
  { id: 'tell_my_kids', label: 'Tell My Kids' },
  { id: 'tell_my_mom', label: 'Tell My Mom' },
  { id: 'our_driver_feedback', label: "Our Driver - Feedback Matters" },
  { id: 'keeping_roads_safe', label: 'Keeping Roads Safe' },
  { id: 'new_driver', label: 'New Driver' },
  { id: 'on_the_clock', label: 'On the Clock' },
  { id: 'rate_this_driver', label: 'Rate This Driver' },
  { id: 'still_got_it', label: 'Still Got It' },
  { id: 'student_driver', label: 'Student Driver' },
];

const GITHUB_BASE = 'https://github.com/TruaxDigital/judge-my-driving/raw/d29729a262739c008d997bd793d1f8f2d5f1d08d';

const DESIGN_URLS = {
  company_vehicle:      `${GITHUB_BASE}/Company%20Vehicle.%20Got%20Feedback.svg`,
  decades_behind_wheel: `${GITHUB_BASE}/Decades%20Behind%20the%20Wheel.%20How%20Am%20I%20Doing.svg`,
  experienced_driver:   `${GITHUB_BASE}/Experienced%20Driver.%20Got%20Feedback.svg`,
  go_easy_new:          `${GITHUB_BASE}/How's%20My%20Driving.%20Go%20Easy,%20I'm%20New.svg`,
  tell_my_boss:         `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Boss.svg`,
  tell_my_dad:          `${GITHUB_BASE}/how's%20My%20Driving.%20Tell%20My%20Dad.svg`,
  tell_my_kids:         `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Kids.svg`,
  tell_my_mom:          `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Mom.svg`,
  our_driver_feedback:  `${GITHUB_BASE}/How's%20Our%20Driver.%20Your%20Feedback%20Matters.svg`,
  keeping_roads_safe:   `${GITHUB_BASE}/Keeping%20Roads%20Safe.%20Rate%20this%20Driver.svg`,
  new_driver:           `${GITHUB_BASE}/New%20Driver.%20Got%20Feedback.svg`,
  on_the_clock:         `${GITHUB_BASE}/On%20the%20Clock,%20On%20the%20Record.svg`,
  rate_this_driver:     `${GITHUB_BASE}/Rate%20this%20Driver.svg`,
  still_got_it:         `${GITHUB_BASE}/Still%20Got%20It,%20Rate%20My%20Driving.svg`,
  student_driver:       `${GITHUB_BASE}/Student%20Driver.%20Score%20My%20Skills.svg`,
};

export default function StickerDesignPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {DESIGNS.map((design) => {
        const isSelected = value === design.id;
        const previewUrl = DESIGN_URLS[design.id];
        return (
          <button
            key={design.id}
            type="button"
            onClick={() => onChange(design.id)}
            className={cn(
              'relative rounded-xl border-2 overflow-hidden text-left transition-all hover:border-primary/60',
              isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'
            )}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={design.label}
                className="w-full h-16 object-cover bg-muted"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-16 bg-zinc-800 flex items-center justify-center">
                <span className="text-yellow-400 font-black text-xs text-center px-2">How's My Driving?</span>
              </div>
            )}
            <div className="px-2 py-1.5 bg-card">
              <p className="text-xs font-medium text-foreground leading-tight">{design.label}</p>
            </div>
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 bg-primary rounded-full">
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}