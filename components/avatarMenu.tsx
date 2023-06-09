import { graphql } from "@/generated";
import { useQuery } from "@apollo/client";
import { Logout } from "@mui/icons-material";
// import { Settings } from "@mui/icons-material"
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Box,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { signOut } from "next-auth/react";

interface UserAvatarProps {
  id: string;
  token: string;
}

const AvatarMenu: React.FC<UserAvatarProps> = ({ id, token }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // Below is how we use the me query o nthe client and find out who has an active session
  const { loading, data } = useQuery(
    graphql(`
      query Me($user: UserAuthInput!) {
        me(user: $user) {
          error
          user {
            email
            id
            role
            username
          }
        }
      }
    `),
    {
      variables: {
        user: { id, token },
      },
    }
  );

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{ p: 0 }}
      >
        <Avatar />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 7,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box display="flex" p={1} justifyContent="center" alignItems="center">
          <Avatar />
          <Typography ml={1}>
            {loading ? "...loading" : data?.me.user?.username}
          </Typography>
        </Box>
        <Divider />
        {data?.me.user?.role === 2 && (
          <MenuItem onClick={() => router.push("/admin")}>
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            Admin
          </MenuItem>
        )}
        {/* <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem> */}
        <MenuItem onClick={() => signOut()}>
          {/* the function on line 118 is from next-auth. It just removes the user's session cookie from their browser and invalidated their jwt token. Nice that they do that for us so we don't have to manage those things. It's probably a good idea to remove the current user's token key from redis before we do this. There's some other things I want to do to clean up our redis hygiene too, so I'll make a ticket for those */}
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default AvatarMenu;
