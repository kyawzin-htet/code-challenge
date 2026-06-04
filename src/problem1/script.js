// Implementation A: Gaussian summation formula - O(1)
var sum_to_n_a = function(n){
    return (n * (n + 1)) / 2;
}



// Implementation B: Iterative loop - O(n)
var sum_to_n_b = function(n) {
    let sum = 0;

    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    
    return sum;
}



// Implementation C: Recursive - O(n)
var sum_to_n_c = function(n) {
    if (n <= 0) {
        return 0;
    }

    return n + sum_to_n_c(n - 1);
} 