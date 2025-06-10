'use client';

import React, { useEffect, useState } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { AvailabilitySlot } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DayPicker } from 'react-day-picker';
import { Loader2, CalendarDays, Clock, Info, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay, parseISO, getMonth, getYear, addMonths, subMonths } from 'date-fns';

// Custom calendar navigation component that will be displayed at the bottom
function CalendarNavigation({ month, onMonthChange }: { month: Date; onMonthChange: (date: Date) => void }) {
  const handlePreviousClick = () => {
    onMonthChange(subMonths(month, 1));
  };

  const handleNextClick = () => {
    onMonthChange(addMonths(month, 1));
  };

  return (
    <div className="flex justify-center space-x-3 mt-3">
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className="h-7 w-7 rounded-full border-gray-300 hover:bg-rose-50 hover:border-rose-300 transition-all p-0"
        onClick={handlePreviousClick}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous month</span>
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className="h-7 w-7 rounded-full border-gray-300 hover:bg-rose-50 hover:border-rose-300 transition-all p-0"
        onClick={handleNextClick}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next month</span>
      </Button>
    </div>
  );
}

const DateTimeSelectionStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const { 
    selectedClinic,
    selectedService,
    selectedProvider,
    selectedDate,
    selectedTimeSlot,
    availabilitySlots,
    isLoading,
    errors 
  } = state;

  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());

  const fetchAvailability = async (clinicId: string, serviceId: string, providerId: string, month: Date) => {
    dispatch({ type: 'SET_AVAILABILITY_LOADING', payload: true });
    try {
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

      const queryParams = new URLSearchParams({
        clinicId,
        serviceId,
        startDate,
        endDate,
      }).toString();

      const res = await fetch(`/api/v1/admin/providers/${providerId}/slots?${queryParams}`);
      if (!res.ok) {
        const errorText = res.status === 404 
          ? 'Availability data could not be found for this provider.' 
          : `An unexpected error occurred (Code: ${res.status}).`;
        throw new Error(errorText);
      }

      const data = await res.json();
      
      // Defensive check for different possible API response shapes
      let rawSlots: { date: string; slots: Array<{ startTime: string; endTime: string; slotId?: string }> }[] = [];
      if (data && data.success && Array.isArray(data.data)) {
        rawSlots = data.data; // Standard success response
      } else if (Array.isArray(data)) {
        rawSlots = data; // Handle cases where the API returns the array directly
      } else {
        throw new Error(data.message || 'Received malformed data from server.');
      }

      const flatSlots: AvailabilitySlot[] = rawSlots.reduce((acc: AvailabilitySlot[], dayGroup) => {
        if (dayGroup && Array.isArray(dayGroup.slots)) {
          dayGroup.slots.forEach(slot => {
            acc.push({ ...slot, slotId: slot.slotId || slot.startTime });
          });
        }
        return acc;
      }, []);

      dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: flatSlots });

    } catch (error) {
      console.error("Error fetching availability:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_AVAILABILITY_ERROR', payload: `We couldn't load availability. ${errorMessage}` });
    }
  };

  useEffect(() => {
    if (selectedProvider && selectedClinic && selectedService) {
      fetchAvailability(selectedClinic.id, selectedService.id, selectedProvider.id, currentMonth);
    } else {
      // Clear availability if context is missing
      dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvider, selectedClinic, selectedService, currentMonth]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      dispatch({ type: 'SELECT_DATE', payload: date });
      if (getMonth(date) !== getMonth(currentMonth) || getYear(date) !== getYear(currentMonth)) {
        setCurrentMonth(date);
      }
    }
  };

  const handleTimeSlotSelect = (slot: AvailabilitySlot) => {
    dispatch({ type: 'SELECT_TIME_SLOT', payload: slot });
  };

  const goToNextStep = () => {
    if (selectedDate && selectedTimeSlot) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 4 });
    }
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
  };

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    return availabilitySlots.filter(slot => 
      isSameDay(parseISO(slot.startTime), selectedDate)
    ).sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
  };

  const dailySlots = getSlotsForSelectedDate();

  const highlightDays = availabilitySlots.map(slot => parseISO(slot.startTime));
  const modifiers = { available: highlightDays };
  const modifiersClassNames = {
    available: 'rdp-day_available'
  };

  if (!selectedProvider || !selectedClinic || !selectedService) {
    return (
        <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Step 3: Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="border-primary/50">
                    <Info className="h-5 w-5 mr-2 text-primary"/>
                    <AlertTitle className="font-semibold text-primary">Missing Information</AlertTitle>
                    <AlertDescription>
                        Please go back and select a clinic, service, and provider first.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={goToPreviousStep}>Back to Provider Selection</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Step 3: Select Date & Time</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Pick a date and time for your appointment with {selectedProvider.fullName} for {selectedService.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading.availabilitySlots && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground p-8">
            <Loader2 className="h-6 w-6 animate-spin" /> 
            <span>Loading available times...</span>
          </div>
        )}

        {errors.availabilitySlots && !isLoading.availabilitySlots && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Availability</AlertTitle>
            <AlertDescription>
              {errors.availabilitySlots}
              <Button 
                onClick={() => fetchAvailability(selectedClinic.id, selectedService.id, selectedProvider.id, currentMonth)}
                variant="secondary"
                size="sm"
                className="mt-2"
                disabled={isLoading.availabilitySlots}
              >
                {isLoading.availabilitySlots && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading.availabilitySlots && !errors.availabilitySlots && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
            {/* Calendar Column */}
            <div className="flex flex-col">
              <div className="flex items-center mb-3">
                <CalendarDays className="h-5 w-5 mr-2 text-rose-500" />
                <h4 className="text-rose-500 font-medium">Select a Date</h4>
              </div>
              
              {/* Calendar Container */}
              <div className="border rounded-lg p-6 pl-8 bg-white shadow-sm  ">
                {/* Use global styles with !important to force the layout */}
                <style jsx global>{`
                  /* Overall calendar container */
                  .calendar-container {
                    width: 100% !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                  }
                  
                  /* Month caption styling */
                  .rdp-caption {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    margin-bottom: 0.5rem !important;
                    padding-bottom: 0.25rem !important;
                  }
                  
                  /* Month name styling */
                  .rdp-caption_label {
                    font-size: 0.875rem !important;
                    font-weight: 500 !important;
                    text-align: center !important;
                    flex: 1 !important;
                  }
                  
                  /* Hide default navigation buttons */
                  .rdp-nav {
                    display: none !important;
                  }
                  
                  /* Force the table to use the full width */
                  .rdp-table {
                    width: 100% !important;
                    display: table !important;
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    table-layout: fixed !important;
                    margin: 0 !important;
                  }
                  
                  /* Make rows display as table rows */
                  .rdp-row, .rdp-head_row {
                    display: table-row !important;
                  }
                  
                  /* Style the day of week headers */
                  .rdp-head_cell {
                    display: table-cell !important;
                    width: 14.28% !important; /* 1/7 of the width */
                    text-align: center !important;
                    padding: 0.25rem 0 !important;
                    font-size: 0.75rem !important;
                    font-weight: 500 !important;
                    color: #6b7280 !important; /* text-gray-500 */
                  }
                  
                  /* Style the day buttons - this applies to ALL day buttons */
                  .rdp-button {
                    margin: 0 auto !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 2rem !important;
                    height: 2rem !important;
                    font-size: 0.875rem !important;
                    border-radius: 9999px !important;
                    transition: all 0.2s !important;
                    cursor: pointer !important;
                    user-select: none !important;
                    padding: 0 !important;
                  }
                  
                  /* Style available days */
                  .rdp-day_available {
                    background-color: #fce7f3 !important; /* bg-pink-100 */
                    color: #be185d !important; /* text-pink-700 */
                  }
                  
                  /* Style selected day */
                  .rdp-day_selected {
                    background-color: #ec4899 !important; /* bg-pink-500 */
                    color: white !important;
                    font-weight: 500 !important;
                  }
                  
                  /* Style hover state */
                  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                    background-color: #f9fafb !important; /* bg-gray-50 */
                    transform: scale(1.05) !important;
                  }
                  
                  /* Style active/pressed state */
                  .rdp-button:active:not([disabled]) {
                    transform: scale(0.95) !important;
                  }
                  
                  /* Disabled days */
                  .rdp-button[disabled] {
                    cursor: not-allowed !important;
                    opacity: 0.4 !important;
                  }
                  
                  /* Fix width and remove right space */
                  .rdp {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                  }
                  
                  /* Ensure month container has no extra space */
                  .rdp-months {
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    display: flex !important;
                    justify-content: center !important;
                  }
                  
                  /* Fix width of month to remove right space */
                  .rdp-month {
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  
                  /* Force cells to be displayed side by side */
                  .rdp-cell {
                    display: table-cell !important;
                    width: 14.28% !important; /* 1/7 of the width */
                    text-align: center !important;
                    padding: 0 !important;
                    vertical-align: middle !important;
                    height: 2.5rem !important; /* Add fixed height */
                  }
                `}</style>
                
                <DayPicker
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) }
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  showOutsideDays
                  fixedWeeks
                  className="calendar-container"
                  classNames={{
                    caption: "flex justify-center items-center relative text-sm font-medium py-2 w-full",
                    caption_label: "text-gray-800 text-center w-full", 
                    day: "h-8 w-8 p-0 font-normal text-sm",
                    day_outside: "text-gray-300", 
                    day_disabled: "text-gray-300",
                    day_hidden: "invisible",
                    day_selected: "bg-primary text-white",
                    day_today: "border border-rose-500",
                  }}
                  weekStartsOn={0}
                  hideNavigation={true}
                />
                
                {/* Custom navigation below the calendar */}
                <CalendarNavigation month={currentMonth} onMonthChange={setCurrentMonth} />
              </div>
            </div>

            {/* Time Slots Column */}
            <div className="flex flex-col">
              <div className="flex items-center mb-3">
                <Clock className="h-5 w-5 mr-2 text-rose-500" />
                <h4 className="text-rose-500 font-medium">
                  Available Times
                  {selectedDate && <span className="text-gray-700 ml-1.5 font-normal">{format(selectedDate, 'EEEE, MMM d')}</span>}
                </h4>
              </div>
              
              <div className="border rounded-lg p-4 bg-white shadow-sm min-h-[300px]">
                {isLoading.availabilitySlots && (
                  <div className="flex items-center justify-center h-full py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500" /> 
                  </div>
                )}
                {errors.availabilitySlots && (
                  <div className="py-4">
                    <Alert variant="destructive" className="mb-4">
                      <Info className="h-5 w-5 mr-2"/>
                      <AlertTitle>Error Loading Slots</AlertTitle>
                      <AlertDescription>{errors.availabilitySlots}</AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {!isLoading.availabilitySlots && !errors.availabilitySlots && !selectedDate && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-500 mb-2">
                      <Info className="h-5 w-5" />
                    </div>
                    <h5 className="text-gray-700 font-medium mb-1">Select a Date</h5>
                    <p className="text-gray-500 text-sm">
                      Please pick a date from the calendar to see available time slots.
                    </p>
                  </div>
                )}

                {!isLoading.availabilitySlots && !errors.availabilitySlots && selectedDate && dailySlots.length === 0 && (
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-amber-800 mb-1">No Slots Available</h5>
                      <p className="text-amber-700 text-sm">
                        There are no time slots available for {format(selectedDate, 'MMMM do, yyyy')}. Please try another date.
                      </p>
                    </div>
                  </div>
                )}

                {!isLoading.availabilitySlots && !errors.availabilitySlots && selectedDate && dailySlots.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {dailySlots.map((slot) => (
                      <Button
                        key={slot.slotId}
                        variant="outline"
                        onClick={() => handleTimeSlotSelect(slot)}
                        className={`
                          w-full text-sm py-5 transition-all duration-200 border border-gray-200
                          ${selectedTimeSlot?.slotId === slot.slotId 
                            ? 'border-primary text-primary hover:bg-primary/5' 
                            : 'bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 active:bg-rose-100 active:transform active:scale-95'
                          }
                        `}
                        disabled={isLoading.availabilitySlots} 
                      >
                        {format(parseISO(slot.startTime), 'h:mm a')}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6 mt-6">
        <Button 
          variant="outline" 
          onClick={goToPreviousStep} 
          disabled={isLoading.availabilitySlots}
          className="transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 active:scale-95"
        >
          Back
        </Button>
        <Button 
          onClick={goToNextStep} 
          disabled={!selectedDate || !selectedTimeSlot || isLoading.availabilitySlots} 
          size="lg"
          className="bg-primary hover:bg-primary/90 transition-all duration-200"
        >
          Next: Confirm Booking
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateTimeSelectionStep; 