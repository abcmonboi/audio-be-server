export const USER_ROLE = { USER: "user", ADMIN: "admin" } as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export const USER_ROLE_VALUES = Object.values(USER_ROLE);

export const USER_STATUS = { ACTIVE: "active", SUSPENDED: "suspended" } as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export const USER_STATUS_VALUES = Object.values(USER_STATUS);
