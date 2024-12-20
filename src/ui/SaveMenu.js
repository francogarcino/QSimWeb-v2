import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHoriz from "@material-ui/icons/MoreHoriz";
import Save from "@material-ui/icons/Save";
import Tooltip from "@material-ui/core/Tooltip";

const options = [
  { key: "clear", label: "Eliminar código de sesión" },
  { key: "download", label: "Descargar archivo" },
];

const ITEM_HEIGHT = 48;

export default function SaveMenu({ handle = () => {}, isCurrentTab }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (key) => {
    if (handle) handle(key); // Llama a handle solo si está definido
    console.log(key);
    setAnchorEl(null);
  };

  return (
    <div>
      <Tooltip title="Guardar código en sesión">
        <IconButton id="save-button" onClick={() => handleClose("save")} disabled={!isCurrentTab}>
          <Save></Save>
        </IconButton>
      </Tooltip>

      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        disabled={!isCurrentTab}
      >
        <MoreHoriz />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.key}
            id={option.key}
            onClick={() => handleClose(option.key)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
