describe('Tag all tasks', () => {
  function tagRecursion() {
    cy.server().route('POST', '/api/anno/tool/save').as('saveTask');

    // Tag all word with random tags
    cy.get('[data-test="button-tag"]', { timeout: 10000 })
      .its('length')
      .then((num) => {
        cy.get('[data-test="word"]').each(($el) => {
          let tag = Math.floor(Math.random() * num);
          cy.get('[data-test="button-tag"]')
            .wait(50)
            .eq(tag)
            .then(($tag) => {
              $el.click();
              $tag.click();
            });
        });
      });
    cy.wait(100);
    // Navigate to next sentence and start process again
    // Else click finish button and wait for save status
    cy.get('button')
      .contains('Next')
      .then(($nextButton) => {
        if ($nextButton.is(':not(:disabled)')) {
          $nextButton.click();
          tagRecursion();
        } else {
          cy.get('[data-test="button-finish"]').then(($finishButton) => {
            $finishButton.click();
            cy.wait('@saveTask').its('status').should('be', 200);

            cy.get('[data-test="continue"]', { timeout: 5000 }); // wait for continue page to load

            cy.get('body', { timeout: 5000 }).then(($body) => {
              if ($body.find('[data-test=button-continue]').length) {
                cy.get('[data-test="button-continue"]')
                  .click()
                  .then(() => tagRecursion());
              } else {
                cy.get('[data-test="button-continue-newTreebank"]')
                  .click()
                  .then(() => selectTreebank());
              }
            });

            if (Cypress.$('[data-test=button-continue]').length > 0) {
            } else {
              cy.get('[data-test="button-continue-newTreebank"]').click();
              selectTreebank();
            }
          });
        }
      });
  }

  function selectTreebank() {
    cy.get('[data-test="button-treebankselection"', { timeout: 20000 })
      .its('length')
      .then((num) => {
        cy.get('[data-test="button-treebankselection"')
          .eq(num - 1)
          .click();
        cy.get('[data-test=button-treebankselection-submit]')
          .click()
          .then(() => tagRecursion());
      });
  }
  // SIGNIN
  it('Signs in', () => {
    cy.visit('/');
    cy.get('[data-test="signinform-username"]').type('din_ann1');
    cy.get('[data-test="signinform-password"]').type('123456789');
    cy.get('[data-test="signinform-button"]').click();
  });

  // START TAGGING
  it('Annotation', () => {
    cy.wait(10000);
    cy.get('body', { timeout: 5000 }).then(($body) => {
      if ($body.find('[data-test="button-treebankselection"]').length) {
        selectTreebank();
      } else {
        tagRecursion();
      }
    });

    cy.location('pathname', { timeout: 5000 }).should('eq', '/tool');
    tagRecursion();
  });
});
