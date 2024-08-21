import { buildForm, registerForm, Validators } from "@rmlibrary/form-builder";
import { Slider } from '@rmlibrary/slider';
import htmlToPDF from "@rmlibrary/html-pdf"
import { calculateRetirementNeeds, calculateProjectedSavings, createGraph } from "./logic";

const form = setupForm();

function setupForm() {
    const form = buildForm({
        user: {
            name: ["", Validators.required],
            age: ["", Validators.required],
            retirementAge: ["", Validators.required],
            annualIncome: ["", Validators.required],
            currentSavings: ["", Validators.required],
            regularContribution: ["", Validators.required],
            Month: ["off", Validators.required],
            Year: ["off", Validators.required]
        },
        spouse: {
            spouseName: ["", Validators.required],
            spouseAge: ["", Validators.required],
            spouseRetirementAge: ["", Validators.required],
            spouseAnnualIncome: ["", Validators.required],
            spouseCurrentSavings: ["", Validators.required],
            spouseRegularContribution: ["", Validators.required],
        },
        assumptions: {
            returnRate: ["", Validators.required],
            inflationRate: ["", Validators.required],
            incomeLast: ["", Validators.required],
            expectedIncome: ["", Validators.required]
        }
    });

    registerForm(document.getElementById("bankForm"), form);
    return form;
}

const sliders = setUpSliders();

// use a function to set up multiple sliders
function setUpSliders() {
    const sliders = {
        user: {
            age: new Slider(document.getElementById("ageSlider"), {
                min: 1,
                max: 100,
                step: 1,
                value: 1
            }),
            retirementAge: new Slider(document.getElementById("retirementSlider"), {
                min: 1,
                max: 100,
                step: 1,
                value: 1
            }),
            annualIncome: new Slider(document.getElementById("incomeSlider"), {
                min: 1,
                max: 500000,
                step: 50,
                value: 1
            }),
            currentSavings: new Slider(document.getElementById("savingsSlider"), {
                min: 1,
                max: 500000,
                step: 50,
                value: 1
            }),
            regularContribution: new Slider(document.getElementById("contributionSlider"), {
                min: 1,
                max: 20000,
                step: 20,
                value: 1
            })
        },
        spouse: {
            spouseAge: new Slider(document.getElementById("spouseAgeSlider"), {
                min: 1,
                max: 100,
                step: 1,
                value: 1
            }),
            spouseRetirementAge: new Slider(document.getElementById("spouseRetirementAgeSlider"), {
                min: 1,
                max: 100,
                step: 1,
                value: 1
            }),
            spouseAnnualIncome: new Slider(document.getElementById("spouseIncomeSlider"), {
                min: 1,
                max: 500000,
                step: 50,
                value: 1
            }),
            spouseCurrentSavings: new Slider(document.getElementById("spouseSavingsSlider"), {
                min: 1,
                max: 500000,
                step: 50,
                value: 1
            }),
            spouseRegularContribution: new Slider(document.getElementById("spouseContributionSlider"), {
                min: 1,
                max: 20000,
                step: 20,
                value: 1
            })
        },
        assumptions: {
            returnRate: new Slider(document.getElementById("returnRateSlider"), {
                min: 1,
                max: 100,
                step: 0.5,
                value: 1
            }),
            inflationRate: new Slider(document.getElementById("inflationRateSlider"), {
                min: 1,
                max: 100,
                step: 0.5,
                value: 1
            }),
            incomeLast: new Slider(document.getElementById("incomeLastSlider"), {
                min: 1,
                max: 100,
                step: 1,
                value: 1
            }),
            expectedIncome: new Slider(document.getElementById("expectedIncomeSlider"), {
                min: 1,
                max: 500000,
                step: 50,
                value: 1
            }),

        }
    }
    return sliders
}

toggleTime();

function toggleTime() {
    const year = document.getElementById("Year");
    const month = document.getElementById("Month");

    year.addEventListener("change", function(event) {
        form.getControl("user").getControl("Month").setValue("off");
    })

    month.addEventListener("change", function(event) {
        form.getControl("user").getControl("Year").setValue("off");
    })
}

function containsLetters(input) {
    var letters = /[a-zA-Z]/;
    return letters.test(input);
}

sliderChanges();

function sliderChanges() {
    // slider
    Object.entries(sliders).forEach(([formKey, formSliders]) => {
        Object.entries(formSliders).forEach(([label, slider]) => {
            slider.on("change", (value) => { // when the slider changes
                // what we do to value (which is initialized in the sliders function)
                if (!isNaN(value)) {
                    form.getControl(`${formKey}`).getControl(`${label}`).setValue(value)
                    $errorMessage.hide();
                    $letterError.hide();
                }
            });

            const inputChanges = document.getElementById(`${label}`);
            const sliderMax = slider.options.sections[1];
            const sliderMin =  slider.options.sections[0];
            let $errorMessage = $(`#${formKey}${label}Error`);
            let $letterError = $(`#${formKey}${label}Letter`);

            $errorMessage.hide();
            $letterError.hide();

            inputChanges.addEventListener("change", function(event) { // add event listener to check if the form input has been changed
                /* if (Number(form.value[formKey][label]) <= sliderMax && Number(form.value[formKey][label]) >= sliderMin) {
                    slider.value = Number(form.value[formKey][label]);
                } */

                if (containsLetters(form.value[formKey][label])) {
                    $letterError.show();
                } else if (slider.value != form.value[formKey][label] && !isNaN(form.value[formKey][label])) {
                    $letterError.hide();

                    if (Number(form.value[formKey][label]) <= sliderMax && Number(form.value[formKey][label]) >= sliderMin) {
                        slider.value = Number(form.value[formKey][label]);
                        $errorMessage.hide();
                    } else if (Number(form.value[formKey][label]) > sliderMax) {
                        slider.value = sliderMax;
                        form.getControl(`${formKey}`).getControl(`${label}`).setValue(sliderMax);
                        $errorMessage.show();
                        
                        // delay hide
                        setTimeout(function() {
                            $errorMessage.hide();
                        }, 2000);
                    } else {
                        slider.value = sliderMin;
                        form.getControl(`${formKey}`).getControl(`${label}`).setValue(sliderMin);
                        $errorMessage.show();

                        setTimeout(function() {
                            $errorMessage.hide();
                        }, 2000);
                    }
                }
            })
        });
    });
}

spouseForm();
let spouse = false;

function spouseForm() {
    // changes in the input will change the slider values
    let $spouseButton = $("#spouseButton");
    let $closeButton = $("#closeButton");
    let $spouseInputs = $("#spouseInputs");
    let $inputs = $("#inputs");
    let $pdfButton = $("#pdfButton");

    $spouseButton.click(() => {
        spouse = true; // should appear 
        $spouseInputs.show();
        $spouseButton.hide();
        $spouseInputs[0].scrollIntoView({ behavior: "smooth", block: "start"});
    });

    $closeButton.click(() => {
        spouse = false;
        $spouseInputs.hide();
        $spouseButton.show();
        $inputs[0].scrollIntoView({ behavior: "smooth", block: "start"});
    })

    $pdfButton.click(() => {
        downloadPDF();
    })
}

calculateResults();

function checkFormInputs() {
    let calculateBoolean = true;

    Object.entries(sliders).forEach(([formKey, formKeyGroup]) => {
        Object.entries(formKeyGroup).forEach(([label, slider]) => {
            let $requiredError = $(`#${formKey}${label}Error`);
            let $letterError = $(`#${formKey}${label}Letter`);

            if (String(formKey) != "spouse" || (String(formKey) == "spouse" && spouse)) {
                if ($requiredError.is(":visible") || $letterError.is(":visible") || form.value[formKey][label] == "") {
                    calculateBoolean = false;
                }
            } 
            
            if (form.value.user.name == "" || (spouse && form.value.spouse.spouseName == "")) {
                calculateBoolean = false;
            }
        })
    })

    return calculateBoolean;
}

function calculateResults() {
    let $calculate = $('#calculate');
    let $results = $('#results');
    let $spouseResults = $('#spouseResults');
    let $pdfContent = $("#pdfContent");
    let $pdfButton = $("#pdfButton");
    let $calculateError = $('#calculateError');

    $results.hide(); // initial condition 
    $spouseResults.hide();
    $pdfContent.hide();
    $pdfButton.hide();
    $calculateError.hide();

    $calculate.click(() => {
        if (checkFormInputs()) {
            $results.show();
            $pdfButton.show();
            $calculateError.hide();

            if (spouse) {
                $spouseResults.show()
            } else {
                $spouseResults.hide()
            }

        } else {
            $calculateError.show();
        } 

            generateGraph();
            $results[0].scrollIntoView({ behavior: 'smooth', block: "start" });
    })
}

function generateGraph() {
    let userData = [projectedUserSavings(), userRetirementNeeds()];
    let spouseData = [projectedSpouseSavings(), spouseRetirementNeeds()];

    createGraph("user", userData[0], userData[1]);
    createGraph("spouse", spouseData[0], spouseData[1]);

    $("#userProjectedSavings").text(`$${userData[0].toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    $("#userRetirementNeeds").text(`$${userData[1].toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    $("#spouseProjectedSavings").text(`$${spouseData[0].toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    $("#spouseRetirementNeeds").text(`$${spouseData[1].toLocaleString(undefined, {minimumFractionDigits: 2})}`);

}

function projectedUserSavings() {
    return calculateProjectedSavings(
        Number(form.value.user.age),
        form.value.user.Year,
        Number(form.value.user.retirementAge),
        Number(form.value.user.regularContribution),
        Number(form.value.user.currentSavings),
        Number(form.value.assumptions.returnRate)
    )
}

function projectedSpouseSavings() {
    return calculateProjectedSavings(
        Number(form.value.spouse.spouseAge),
        form.value.user.Year,
        Number(form.value.spouse.spouseRetirementAge),
        Number(form.value.spouse.spouseRegularContribution),
        Number(form.value.spouse.spouseCurrentSavings),
        Number(form.value.assumptions.returnRate)
    )
}

function userRetirementNeeds() {
    return calculateRetirementNeeds(
        Number(form.value.assumptions.returnRate),
        Number(form.value.user.retirementAge),
        Number(form.value.assumptions.incomeLast),
        Number(form.value.assumptions.expectedIncome)
    )
}

function spouseRetirementNeeds() {
    return calculateRetirementNeeds(
        Number(form.value.assumptions.returnRate),
        Number(form.value.spouse.spouseRetirementAge),
        Number(form.value.assumptions.incomeLast),
        Number(form.value.assumptions.expectedIncome)
    )
}

function downloadPDF() {
    $("#userGraph").attr("src", $("#userCanvas")[0].toDataURL()); // set the image to the image of the generated graph
    $("#spouseGraph").attr("src", $("#spouseCanvas")[0].toDataURL()); // ^^

    // user information
    $("#userName").text(form.value.user.name);
    $("#userAge").text(form.value.user.age);
    $("#userRetirementAge").text(form.value.user.retirementAge);
    $("#userIncome").text("$" + form.value.user.annualIncome.toLocaleString(undefined, {minimumFractionDigits: 2}));
    $("#userSavings").text("$" + form.value.user.currentSavings.toLocaleString(undefined, {minimumFractionDigits: 2}));
    $("#userContribution").text("$" + form.value.user.regularContribution.toLocaleString(undefined, {minimumFractionDigits: 2}));

    //spouse information
    $("#spousePdfName").text(form.value.spouse.spouseName);
    $("#spousePdfAge").text(form.value.spouse.spouseAge);
    $("#spousePdfRetirementAge").text(form.value.spouse.spouseRetirementAge);
    $("#spousePdfIncome").text("$" + form.value.spouse.spouseAnnualIncome.toLocaleString(undefined, { minimumFractionDigits: 2}));
    $("#spousePdfSavings").text("$" + form.value.spouse.spouseCurrentSavings.toLocaleString(undefined, { minimumFractionDigits: 2}));
    $("#spousePdfContribution").text("$" + form.value.spouse.spouseRegularContribution.toLocaleString(undefined, { minimumFractionDigits: 2}));

    // assumptions
    $("#pdfRateReturn").text(Math.round(form.value.assumptions.returnRate * 100) / 100 + "%");
    $("#pdfInflation").text(Math.round(form.value.assumptions.inflationRate * 100) / 100 + "%");
    $("#pdfLifeExpectancy").text(form.value.assumptions.incomeLast);
    $("#pdfExpectedIncome").text("$" + form.value.assumptions.expectedIncome.toLocaleString(undefined, { minimumFractionDigits: 2}));

    $("#pdfSpouseRateReturn").text(Math.round(form.value.assumptions.returnRate * 100) / 100 + "%");
    $("#pdfSpouseInflation").text(Math.round(form.value.assumptions.inflationRate * 100) / 100 + "%");
    $("#pdfSpouseLifeExpectancy").text(form.value.assumptions.incomeLast);
    $("#pdfSpouseExpectedIncome").text("$" + form.value.assumptions.expectedIncome.toLocaleString(undefined, { minimumFractionDigits: 2}));

    // displaying results:
    let userData = [projectedUserSavings(), userRetirementNeeds()];
    let spouseData = [projectedSpouseSavings(), spouseRetirementNeeds()];

    $("#userPdfProjectedSavings").text(`$${userData[0].toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    $("#userPdfRetirementNeeds").text(`$${userData[1].toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    $("#spousePdfProjectedSavings").text(`$${spouseData[0].toLocaleString(undefined, {minimumFractionDigits: 2})}`);
    $("#spousePdfRetirementNeeds").text(`$${spouseData[1].toLocaleString(undefined, {minimumFractionDigits: 2})}`);

    // remove spouse page if it is not inputted
    console.log(spouse);
    
    if (!spouse) {
        $("#spousePdfPage").hide();
    } else {
        $("#spousePdfPage").show();
    }

    const pdfReport = htmlToPDF.generate($("rm-html-pdf")[0]);
    $("#pdfDownload").attr("href", pdfReport.doc.output("datauristring"));
    $("#pdfDownload")[0].click(); // automatically click the link (open the pdf)
}
