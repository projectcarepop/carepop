/**
 * Data Transfer Object (DTO) for updating a user's profile.
 * Defines the expected shape of the request body for the profile update API endpoint.
 * All fields are optional to allow partial updates.
 */
export interface UpdateProfileDto {
  firstName?: string | null;
  middleInitial?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;      // Expected as 'YYYY-MM-DD' string
  civilStatus?: string | null;
  religion?: string | null;
  occupation?: string | null;
  street?: string | null;
  provinceCode?: string | null;     // Corresponds to province_code in DB
  cityMunicipalityCode?: string | null; // Corresponds to city_municipality_code in DB
  barangayCode?: string | null;     // Corresponds to barangay_code in DB
  contactNo?: string | null;
  philhealthNo?: string | null;
  genderIdentity?: string | null;
  pronouns?: string | null;
  assignedSexAtBirth?: string | null;
  // Note: avatar_url is typically handled by a separate upload mechanism + update, not direct DTO field.
  // Note: age is typically calculated, not directly set via DTO.
} 