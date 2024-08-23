describe("Phone-Branch - Toggle", () => {
    it("Successful Toggle between Phone and Branch", () => {
        cy.visit("http://localhost:4200/#/product-selection");
        cy.url().should('include', '/#/product-selection')
        const shadow = () => cy.get("one-app").shadow();

        shadow().find("h3.toggle-phone-branch").should("have.text", "Phone").click();
        shadow().find("h3.toggle-phone-branch").should("have.text", "Branch").click();
        shadow().find("h3.toggle-phone-branch").should("have.text", "Phone");
    });
});
