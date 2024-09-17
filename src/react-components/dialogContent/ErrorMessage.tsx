import * as React from 'react';

export function ErrorMessage() {

    const spanStyle: React.CSSProperties = {
        padding: "0 10px",
        alignSelf: "center",
        justifySelf: "center",
        scale: "1.3"
    }

    const onBtnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        const modal = document.getElementById("error-dialog")
        if (!(modal && modal instanceof HTMLDialogElement)) {return}
        modal.close()
    }

    // function errorPopUp(error: string) {
    //     toggleModal("error-dialog")
    //     const errorMessage = document.getElementById("error-message") as HTMLParagraphElement
    //     errorMessage.textContent = error
    // }

    // function toggleModal(id: string) {
    //     const modal = document.getElementById(id)
    //     if (modal && modal instanceof HTMLDialogElement) {
    //       modal.open? modal.close() : modal.showModal()
    //       console.log(`The Modal ${modal} was toggled`)
    //     } else {
    //       console.warn("The provided modal wasn't found in the DOM. ID: ", id)
    //     }
    //   }

    return (
    <dialog id="error-dialog">
        <div id="error-dialog-container">
          <span
            className="material-icons-sharp"
            style={spanStyle}
          >
            error_outline
          </span>
          <p id="error-message" style={{ padding: "0 10px" }} />
          <button onClick={(e) => onBtnClick(e)} id="error-dialog-btn">OK</button>
        </div>
    </dialog>
    )
}