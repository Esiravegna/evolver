#evolver


Genetic optmizer with elasticity check for JavaScript

##Genetic Algoritms

TL;DR
Essentially, an optimizer for polynomial equation solutions that assumes that recombining the terms of the proposed solutions and iterating and discarding the worst solutions, eventually will reach to the max (or min, depending on the cost function) value, by using a Natural Selection like process.

Check [here](http://www.ai-junkie.com/ga/intro/gat1.html) for more infornation.[Wikipedia](http://en.wikipedia.org/wiki/Genetic_algorithm) has a neat introduction and some useful links too to the math stuff.


##Usage
```javascript        
    var myPopulation = new Evolver(model,finalTerm,max,min,goal,investment);                
    //DO da evolution, BABY!                
    var theSolution = myPopulation.run();
    //lets find the diminished returns zone 
    var maxInvestment = myPopulation.maxInvestment(theSolution);        
    var maxSolution = theSolution.raw;
    maxSolution = maxSolution.normalize(maxInvestment);
    var maxResult = myPopulation.runmodel(maxSolution);
```
