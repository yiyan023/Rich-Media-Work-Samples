describe('PDF Download - Personal Line of Credit', () => {
  it('Successfully Downloads PDF for TD Personal Line of Credit', () => {
    cy.visit("http://localhost:4200/#/product-selection");
    cy.url().should('include', '/#/product-selection')

    const shadow = () => cy.get("one-app").shadow();

    // switch to phone:
    shadow().find("h3.toggle-phone-branch").should("have.text", "Phone").click();
    shadow().find("h3.toggle-phone-branch").should("have.text", "Branch")

    // pressing TD Personal Line of Credit Button
    shadow().find('input#btn-loc').should('have.css', 'background-color').and('equal','rgba(0, 0, 0, 0)');
    shadow().find("button.btn.td-btn-primary-light").should('be.disabled')
    shadow().find('input#btn-loc').click();
    shadow().find('input#btn-loc').should('have.css', 'background-color').and('equal','rgb(0, 138, 0)');
    shadow().find("button.btn.td-btn-primary-light").should('have.css', 'background-color').and('equal','rgb(0, 138, 0)');

    // starting application - life insurance
    shadow().find("button#start-application-button").click()
    shadow().find(".btn.td-btn-CTA").should("be.disabled");
    shadow().find("label#afternoon-contact").click();
    shadow().find('#life-insurance-button').click();
    shadow().find(".btn.td-btn-CTA").should("have.css", "background-color").and("equal", "rgb(255, 149, 0)")
    shadow().find(".btn.td-btn-CTA").click( { multiple: true, force: true } );

    // pdf download - life insurance 
    cy.intercept('GET', '**/*.pdf').as('pdfDownload');

    // change to spouse tab & do everything again 
    shadow().contains("John Smith").click()

    // starting application for spouse - Life Insurance
    shadow().find("label#afternoon-contact").click();
    shadow().find('#life-insurance-button').click();
    shadow().find(".btn.td-btn-CTA").should("have.css", "background-color").and("equal", "rgb(255, 149, 0)")
    shadow().find(".btn.td-btn-CTA").click( { multiple: true, force: true } );

    // pdf download - life insurance
    cy.intercept('GET', '**/*.pdf').as('pdfDownload');
  })
})
