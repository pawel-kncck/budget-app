// BUDGET COBTROLLER MODULE
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        })
        data.totals[type] = sum;
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new id
            if (data.allItems[type].length === 0) {
                ID = 1;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            

            // Create new item based on 'exp' or 'inc' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            };

            // Push new item to the data structure
            data.allItems[type].push(newItem);

            // Return new item
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp

            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
})()




// UI CONTROLLER MODULE
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expensesValue: '.budget__expenses--value',
        percentageValue: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNum = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

        dec = numSplit[1];

        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholders
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">\
                <div class="item__description">%description%</div><div class="right clearfix">\
                <div class="item__value">%value%</div><div class="item__delete">\
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i>\
                </button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>\
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>\
                <div class="item__delete"><button class="item__delete--btn">\
                <i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholders with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', formatNum(obj.value, type));
            newHtml = newHtml.replace('%description%', obj.description);

            // Insert new HTML into the UI
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            })

            fieldsArr[0].focus();
        },

        deleteListItem: function(selectorId) {
            var el = document.getElementById(selectorId)

            el.parentNode.removeChild(el);
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.itemPercentage);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
            })


        },

        displayBudget: function(obj) {
            var type;

            type = obj.budget < 0 ? 'exp' : 'inc';

            document.querySelector(DOMstrings.budgetValue).textContent = formatNum(obj.budget, type);
            document.querySelector(DOMstrings.incomeValue).textContent = formatNum(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesValue).textContent = formatNum(obj.totalExp,'epx');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageValue).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageValue).textContent = '---';
            }
        },

        displayMonth: function() {
            var now, year, month;

            now = new Date();
            months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Doc']
            month = months[now.getMonth()];
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
                );
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }   
    }
})()




// APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMstrings()

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', function() {
            UICtrl.changeType();
        })
    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        //inc-1
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. Delete the item from the data structure
        budgetCtrl.deleteItem(type,ID);
        console.log('type: ' + type + ', ID: ' + ID);

        // 2. Delete list item from the UI
        UICtrl.deleteListItem(itemID);

        // 3. Update budget
        updateBudget();

        // 4. Update percentages
        updatePercentages();

    };

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the input data
        input = UICtrl.getInput();

        if (input.description !== ''  && !isNaN(input.value) && input.value > 0) {
           
            // 2. Add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new item to user interface
            UICtrl.addListItem(newItem, input.type);
            
            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Update percentages
            updatePercentages();
        }
    }

    return {
        init: function() {
            console.log('Application has started.');
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            UICtrl.displayMonth();
        }
    }

    
        
})(budgetController,UIController)

controller.init();