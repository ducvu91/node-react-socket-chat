var inventory = [
    {name: 'apples', quantity: 2},
    {name: 'bananas', quantity: 0},
    {name: 'cherries', quantity: 5}
];
function findA(name){
    var abc;
    inventory.forEach(function(elment, index){
        if(elment.name === name)
        {
            abc = index;
        }

    });
    return abc;
}
console.log(findA('cherries'));