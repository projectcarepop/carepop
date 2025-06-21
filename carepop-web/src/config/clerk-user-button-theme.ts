import { UserButtonProps } from "@clerk/types";

export const userButtonAppearance: UserButtonProps['appearance'] = {
    elements: {
      userButtonAvatarBox: {
        '--cl-user-button-avatar-background': 'hsl(349 100% 65%)',
      },
      userButtonPopoverCard: {
        boxShadow: 'none',
        border: '1px solid hsl(210 14% 89%)',
        width: '240px',
      },
      userButtonPopoverActionButton: {
        "&:hover": {
            backgroundColor: "hsl(210 14% 95%)",
        },
        "&:focus": {
            backgroundColor: "hsl(210 14% 95%)",
        },
      },
      userButtonPopoverActionButton__manageAccount: {
        color: 'hsl(210 9% 31%)',
      },
      userButtonPopoverActionButton__signOut: {
        color: 'hsl(210 9% 31%)',
      },
      userButtonPopoverFooter: {
        display: 'none',
      }
    },
  }; 