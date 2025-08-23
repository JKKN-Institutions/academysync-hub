import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimeInputProps {
  value?: string; // 24-hour format (HH:MM)
  onChange?: (value: string) => void; // Returns 24-hour format (HH:MM)
  placeholder?: string;
  className?: string;
  id?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value = '',
  onChange,
  placeholder = "Select time",
  className = '',
  id
}) => {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  // Convert 24-hour format to 12-hour format
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      const hour24 = parseInt(hours, 10);
      const minute12 = minutes || '00';
      
      if (hour24 === 0) {
        setHour('12');
        setPeriod('AM');
      } else if (hour24 < 12) {
        setHour(hour24.toString());
        setPeriod('AM');
      } else if (hour24 === 12) {
        setHour('12');
        setPeriod('PM');
      } else {
        setHour((hour24 - 12).toString());
        setPeriod('PM');
      }
      
      setMinute(minute12);
    }
  }, [value]);

  // Convert 12-hour format to 24-hour format and call onChange
  const updateTime = (newHour: string, newMinute: string, newPeriod: string) => {
    let hour24 = parseInt(newHour, 10);
    
    if (newPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (newPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinute}`;
    onChange?.(timeString);
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    updateTime(hour, minute, newPeriod);
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ['00', '15', '30', '45'];

  return (
    <div className={`flex items-center space-x-2 ${className}`} id={id}>
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <div className="flex items-center space-x-1 pl-10">
          {/* Hour Select */}
          <Select value={hour} onValueChange={handleHourChange}>
            <SelectTrigger className="w-16 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map(h => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-muted-foreground">:</span>
          
          {/* Minute Select */}
          <Select value={minute} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-16 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* AM/PM Select */}
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-16 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};