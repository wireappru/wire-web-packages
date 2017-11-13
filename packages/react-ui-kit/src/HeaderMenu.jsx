import styled, {css} from 'styled-components';
import {COLOR} from './variables';
import {media} from './mixins';
import PropTypes from 'prop-types';
import React from 'react';
import {Text} from './Text';

const MenuWrapper = styled.div`
  height: 22px;
`;

const MenuButton = styled.div`
  display: none;
  position: fixed;
  ${media.extraSmall`
    display: block;
    z-index: 2;
    div {
      width: 16px;
      height: 2px;
      background-color: ${COLOR.BLACK};
      margin: 4px;
      transition: all 0.24s ease-in-out;
    }
    ${props =>
      props.isOpen &&
      css`
        div:nth-of-type(2) {
          opacity: 0;
          transform: scale(0, 1);
        }
        div:nth-of-type(1) {
          transform: translateY(6px) rotate(-45deg);
        }
        div:nth-of-type(3) {
          transform: translateY(-6px) rotate(45deg);
        }
      `};
  `}
  }
`;

const MenuItem = ({Component = 'a', ...props}) => {
  const StyledItem = Text.withComponent(Component).extend`
  ${media.extraSmall`
  display: block;
  font-size: 24px;
  font-weight: 400;
  text-transform: none;
  margin: 0;
  text-align: left;
  padding: 8px 24px;
  max-width: 480px;
  width: 100%;
`}`;
  return <StyledItem {...props} />;
};

const MenuContainer = styled.div`
  ${media.extraSmall`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: ${COLOR.WHITE};
    z-index: 1;
    transform: translateX(110%);
    transition: transform 0.25s ease-in-out;
    ${props =>
      props.isOpen &&
      css`
        transform: translateX(0);
      `};
  `};
`;

const noop = () => {};

class Menu extends React.PureComponent {
  state = {isOpen: false};

  toggleMenu = () => {
    window.scrollTo(0, 0);
    this.setState(state => {
      if (state.isOpen) {
        this.props.onClose();
      } else {
        this.props.onOpen();
      }
      return {isOpen: !state.isOpen};
    });
  };

  closeMenu = callback => {
    this.props.onClose();
    this.setState({isOpen: false}, callback);
  };

  render() {
    const isOpen = this.state;
    const menuItems = React.Children.map(this.props.children, child => {
      console.log(child);
      const originalOnClick = child.props.onClick || noop;
      return React.cloneElement(child, {onClick: () => this.closeMenu(originalOnClick)});
    });
    return (
      <MenuWrapper {...isOpen}>
        <MenuContainer {...isOpen}>{menuItems}</MenuContainer>
        <MenuButton {...isOpen} onClick={this.toggleMenu}>
          <div />
          <div />
          <div />
        </MenuButton>
      </MenuWrapper>
    );
  }
}

Menu.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
};

Menu.defaultProps = {
  children: null,
  onClose: noop,
  onOpen: noop,
};

export {Menu, MenuItem};
