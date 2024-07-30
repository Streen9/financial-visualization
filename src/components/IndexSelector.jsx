import PropTypes from 'prop-types';
import { ButtonGroup, Button, styled } from '@mui/material';

const StyledButton = styled(Button)(({ theme, selected }) => ({
  padding: theme.spacing(1, 2),
  fontSize: theme.typography.pxToRem(14),
  fontWeight: theme.typography.fontWeightMedium,
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
  borderColor: theme.palette.divider,
}));

const IndexSelector = ({ selectedIndex, onIndexChange }) => {
  return (
    <ButtonGroup variant="outlined" aria-label="index selector">
      <StyledButton
        selected={selectedIndex === "NIFTY200"}
        onClick={() => onIndexChange("NIFTY200")}
      >
        NIFTY200
      </StyledButton>
      <StyledButton
        selected={selectedIndex === "NIFTY500"}
        onClick={() => onIndexChange("NIFTY500")}
      >
        NIFTY500
      </StyledButton>
    </ButtonGroup>
  );
};

IndexSelector.propTypes = {
  selectedIndex: PropTypes.string.isRequired,
  onIndexChange: PropTypes.func.isRequired,
};

export default IndexSelector;