import * as React from "react";
import {act, render, fireEvent} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {Modal, ModalContent, ModalBody, ModalHeader, ModalFooter} from "../src";

// e.g. console.error Warning: Function components cannot be given refs.
// Attempts to access this ref will fail. Did you mean to use React.forwardRef()?
const spy = jest.spyOn(console, "error").mockImplementation(() => {});

describe("Modal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const wrapper = render(
      <Modal isOpen>
        <ModalContent>
          <ModalHeader>Modal header</ModalHeader>
          <ModalBody>Modal body</ModalBody>
          <ModalFooter>Modal footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );

    expect(() => wrapper.unmount()).not.toThrow();

    expect(spy).toBeCalledTimes(0);
  });

  it("ref should be forwarded", () => {
    const ref = React.createRef<HTMLElement>();

    render(
      <Modal ref={ref} isOpen>
        <ModalContent>
          <ModalHeader>Modal header</ModalHeader>
          <ModalBody>Modal body</ModalBody>
          <ModalFooter>Modal footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );
    expect(ref.current).not.toBeNull();
  });

  test("should have the proper 'aria' attributes", () => {
    const {getByRole, getByText} = render(
      <Modal isOpen>
        <ModalContent>
          <ModalHeader>Modal header</ModalHeader>
          <ModalBody>Modal body</ModalBody>
          <ModalFooter>Modal footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );

    const modal = getByRole("dialog");

    expect(modal).toHaveAttribute("aria-modal", "true");
    expect(modal).toHaveAttribute("role", "dialog");

    const modalHeader = getByText("Modal header");

    expect(modal).toHaveAttribute("aria-labelledby", modalHeader.id);

    const modalBody = getByText("Modal body");

    expect(modal).toHaveAttribute("aria-describedby", modalBody.id);
  });

  test("should fire 'onOpenChange' callback when close button is clicked", () => {
    const onClose = jest.fn();

    const {getByLabelText} = render(
      <Modal isOpen onClose={onClose}>
        <ModalContent>
          <ModalHeader>Modal header</ModalHeader>
          <ModalBody>Modal body</ModalBody>
          <ModalFooter>Modal footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );

    const closeButton = getByLabelText("Close");

    act(() => {
      closeButton.click();
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("should hide the modal when pressing the escape key", () => {
    const onClose = jest.fn();

    const wrapper = render(
      <Modal isOpen onClose={onClose}>
        <ModalContent>
          <ModalHeader>Modal header</ModalHeader>
          <ModalBody>Modal body</ModalBody>
          <ModalFooter>Modal footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );

    const modal = wrapper.getByRole("dialog");

    fireEvent.keyDown(modal, {key: "Escape"});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should only hide the top-most modal", async () => {
    const onClose1 = jest.fn();
    const onClose2 = jest.fn();

    render(
      <Modal isOpen onClose={onClose1}>
        <ModalContent>
          <ModalHeader>Modal header</ModalHeader>
          <ModalBody>Modal body</ModalBody>
          <ModalFooter>Modal footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );

    const wrapper2 = render(
      <Modal isOpen onClose={onClose2}>
        <ModalContent>
          <ModalHeader>Modal header</ModalHeader>
          <ModalBody>Modal body</ModalBody>
          <ModalFooter>Modal footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );

    await userEvent.click(document.body);
    expect(onClose1).not.toHaveBeenCalled();
    expect(onClose2).toHaveBeenCalledTimes(1);

    wrapper2.unmount();

    await userEvent.click(document.body);
    expect(onClose1).toHaveBeenCalledTimes(1);
  });
});
