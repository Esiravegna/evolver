	/**
	* Prototype functions for the Array class
	*
	*
	*/
	Array.prototype.sum = function() {
	    for (var i = 0, sum = 0; i < this.length; sum += this[i++]);
	    return sum;
	}
	Array.prototype.normalize = function(max) {
	    var normalized = new Array();
	    for (var i = 0, sum = 0; i < this.length; sum += this[i++]);
	    for (var i = 0; i < this.length; normalized.push((this[i++] / sum) * max));
	    return normalized;
	}
	Array.prototype.max = function() {
	    return Math.max.apply({}, this)
	}
	Array.prototype.min = function() {
	    return Math.min.apply({}, this)
	}
	
	/**
	 * EVOLVER
	 * V 1.0
	 * Uses  a genetic algorithm to optimize a model in the form of
	 * R = (a * v1) ^ v2 + ... + (an * vn1) ^ vn2

	 * 
	 */
	/**
	 * Constructor.
	 *  Takes the model, its linear term, maxValues, minValues, the goal and the investment as paremeters
	 *  maxValues and minValeus are
	 *
	 */
	function Evolver(
	    model,
	    linearterm,
	    maxValues,
	    minValues,
	    goal,
	    investment
	) {
	    /**
		 * sort_by
		 * 
		 * Sorts an array of objects using the field given, reverse if asked (boolean),
		 * by type asked (parseInt,parseFloat,etc) in the primer
		 * 
		 */
	    this.sort_by = function(field, reverse, primer) {
	        var key = function(x) {
	            return primer ? primer(x[field]) : x[field]
	        };

	        return function(a, b) {
	            var A = key(a),
	                B = key(b);
	            return ((A < B) ? -1 :
	                (A > B) ? +1 : 0) * [-1, 1][+!!reverse];
	        }
	    };
	    /**
	     * returns an array of items elements, varying between the 
	     * MaxValue and MinValue, randomly.
	     * this Array is an idividual of the model
	     */
	    this.individual = function(items) {
	        var Ind = new Array();
	        var newInd = new Array();
	        for (var i = 0; i < items; i++) {
	            Ind.push(this.config.minValue[i] + Math.random() * (this.config.maxValue[i] - this.config.minValue[i]));
	        }
	        var diff = 0;
	        var newInd = Ind.normalize(this.config.investment);

	        //constrain checking
	        for (var i = 0; i < items; i++) {
	            if (newInd[i] > this.config.maxValue[i]) {
	                diff += newInd[i] - this.config.maxValue[i];
	                newInd[i] = this.config.maxValue[i];
	            }
	            if (newInd[i] < this.config.minValue[i]) {
	                diff -= this.config.minValue[i] - newInd[i];
	                newInd[i] = this.config.minValue[i];
	            }
	            if (newInd[i] + diff < this.config.minValue[i]) {
	                newInd[i] += diff;
	                diff = 0;
	            }
	        }
	        return newInd;
	    };
	    /**
	     * generates an array of this.config.populationsize individuals.
	     * 
	     */
	    this.population = function() {
	        var population = new Array();
	        for (var i = 0; i <= this.config.populationsize; i++) {
	            population.push(this.individual(this.config.model.length));
	        }
	        return population;
	    };
	    /**
	     *  For a given individual, calculates the fitness.
	     *  This parameter is critical in the evolution (see below)
	     *  in this case, fitness is 1/the model result, if positive and 
	     *  Abs(the result) if negative
	     *  
	     *  The closer to 0, the fittest an individual will be.
	     * 
	     */
	    this.fitness = function(individual) {
	        theResult = this.runmodel(individual);
	        if (theResult > 0) {
	            return 1 / theResult;
	        } else {
	            return Math.abs(theResult);
	        }

	    };
	    /**
	     *  for a given population, calculates the average fitness.
	     * 
	     */
	    this.grade = function(pop) {
	        var sum = 0;
	        for (var i = 0; i < pop.length; i++) {
	            sum += fitness(pop[i])
	        }
	        return (sum / pop.length);
	    };
	    /**
		   * Simply runs the model by using a given solution.
		   * 
		   */
	    this.runmodel = function(solution) {
	        var theResult = 0;
	        for (var i = 0; i < model.length; i++) {
	            theResult += Math.pow(solution[i] * this.config.model[i].coef, this.config.model[i].power);
	        }
	        theResult += this.config.linearterm;
	        return theResult;
	    };
	    /**
		 *  Runs the given solution and returns the result
		 * 
		 */
	    this.evaluate = function(solution) {
	        var distributed = solution.normalize(this.config.investment);
	        return this.runmodel(distributed);
	    };
	    /**
		   * The core function
		   * for a Given population, evolves it considering the 
		   *  fittest individuals and how many to keep of them,
		   *  breeding 
		   * 
		   */
	    this.evolve = function(pop) {
	        var graded = new Array();
	        var parents = new Array();
	        // lets sort of population by fitness
	        for (var i = 0; i < pop.length; i++) {
	            graded.push({
	                "fitness": this.fitness(pop[i]),
	                "individual": pop[i]
	            });
	        }
	        graded = graded.sort(this.sort_by('fitness', false, parseFloat));
	        //now, how many of them will survive into the next generation?
	        var survivors = Math.floor(graded.length * this.config.keepratio);
	        for (var i = survivors; i < graded.length; i++) {
	            parents.push(graded[i].individual);
	        }
	        //some individuals will survive by sheer chance (this.config.random_select
	        for (var i = 0; i <= survivors - 1; i++) {
	            if (this.config.random_select > Math.random())
	            {
	                parents.push(graded[i].individual);
	            }
	        }
	        //some other individuals will mutate (this-config-mutate)
	        for (var i = 0; i < parents.length; i++) {
	            if (this.config.mutate > Math.random()) {
	                var mutante = Math.floor(Math.random() * (parents.length - 1));
	                for (var i = 0; i < parents[mutante].length; i++) {
	                    parents[mutante][i] = this.config.minValue[i] + Math.random() * (this.config.maxValue[i] - this.config.minValue[i]);
	                }
	                parents[mutante] = parents[mutante].normalize(this.config.investment);
	            }
	        }
	        // now, for the survivors, lets recombine so they will produce childrens
	        var theParentslist = parents.length;
	        var theIdeal = pop.length - theParentslist;
	        var children = new Array();
	        //while we dont get enough kids:
	        while (children.length < theIdeal) {
	            var dadIdx = Math.floor(Math.random() * (theParentslist - 1));
	            var momIdx = Math.floor(Math.random() * (theParentslist - 1));
	            //a given individual cannot be father and mother at the same time
	            if (dadIdx != momIdx) {
	                var dad = parents[dadIdx];
	                var mom = parents[momIdx];
	                var half = Math.floor(dad.length / 2);
	                //a child is simply half of the attributes of the father and half of the mother
	                var child = (dad.slice(0, half)).concat(mom.slice(half));
	                //do we enforce the max/min?
	                //by default, yes, it does                                      
	                for (var i = 0; i < children.length; i++) {
	                    if (children[i] < this.config.minValue[i]) {
	                        children[i] = this.config.minValue[i]
	                    } else if (children[i] > this.config.maxValue[i]) {
	                        children[i] = this.config.maxValue[i]
	                    }
	                }
	                //if(childrenWithinMinMax) 
	                children.push(child.normalize(this.config.investment));
	            }
	        }
	        //simply we add the children...et voila
	        parents.concat(children);
	        return parents;
	    };
	    /**
		*  runs the model with the given config,
		*  returns a json object in the form:
		*  {solution:[array, the fittest individual],"percent":[array, % of each value],"result":float, the final result of the model
		*/
	    this.run = function() {
	        this.config.population = this.population();
	        var gens = this.config.generations;
	        while (gens != 0) {
	            this.config.population = this.evolve(this.config.population);
	            gens--;
	        }
	        var thesolution = this.config.population[this.config.population.length - 1];
	        var thesolutionnamed = new Array();
	        for (var i = 0; i < thesolution.length; i++) {
	            thesolutionnamed[this.config.model[i].desc] = thesolution[i];
	        }
	        var normalizednamed = new Array();
	        var percentbuffer = thesolution.normalize(1);
	        for (var i = 0; i < percentbuffer.length; i++) {
	            normalizednamed[this.config.model[i].desc] = percentbuffer[i];
	        }
	        var result = {
	            "solution": thesolutionnamed,
	            "percent": normalizednamed,
	            "result": this.evaluate(thesolution),
	            "raw": thesolution,
	            "investment": this.config.investment
	        }
	        return result;

	    };
	    /**
	     * maxInvestment
	     * returns the maximum investment available for the 
	     * Given solution
	     * @var theSolution object solution. @see this.run
	     * @returns maxRevenue float the maximum investment we can spend for the solution
	     */
	    this.maxInvestment = function(theSolution) {
	        var Decimals = 2;
	        var theSum = 0;
	        //elasticity
	        var Elasticity = 0;
	        var minInvestment = 1; //lets find out the minium
	        var Investment = [30000, 1445000] //we should initialize to a different than zero. Fucking models; 
	        //loop until we find out the minimum
	        for (minInvestment = 10; this.runmodel(theSolution.raw.normalize(minInvestment)) < 1; minInvestment += 10)
	        {
	            Investment = [minInvestment + 10, minInvestment * 1.15];
	        }
	        //got it, lets fill the arrays
	        var Results = [this.runmodel(theSolution.raw.normalize(Investment[0])), this.runmodel(theSolution.raw.normalize(Investment[1]))];
	        var currentInvestment = Investment[0];
	        //lets fix the precision via the decimals on the model          
	        for (var i = 0; i < this.config.model.length; i++) {
	            theSum += this.config.model[i].coef;
	        }
	        if (1 / theSum > Decimals) {
	            Decimals += 1;
	        }
	        //Now, how much can we spend before reaching diminished yield?
	        do {
	            //the elasticity calculation. 2 decimals proved to work just fine.
	            Elasticity = ((Results[1] - Results[0]) / ((Investment[1] - Investment[0]) * (Results[0] / Investment[0]))).toFixed(Decimals);
	            // now the current data would be the new data
	            Investment[0] = currentInvestment;
	            Results[0] = this.runmodel(theSolution.raw.normalize(currentInvestment));
	            // If the elasticity is too big, we may get bumps in the function walk, therefore log is called to smooth the curve
	            if (Elasticity > 10) {
	                currentInvestment *= 1 + (Math.log(Elasticity) - 1);
	            }
	            //lets grow the investment
	            else {
	                currentInvestment *= 1 + (Elasticity - 1);
	            }
	            Investment[1] = currentInvestment;
	            Results[1] = this.runmodel(theSolution.raw.normalize(currentInvestment));
	        } while (Math.abs(Elasticity) > 1)

	        //do we exceed our budget?
	        return currentInvestment;
	    };

	    /**
		* configuration object
		*/
	    this.config = {
	        /**
			   * @var goal float max investment we can have
			   */
	        goal: 0,
	        // maximum investment we will have. Our budget
	        investment: 0,
	        /**
			   * @var maxValue array list of max values each attribute can have
			   */
	        maxValue: new Array(),
	        /**
			   * @var minValue array list of min values each attribute can have
			   */
	        minValue: new Array(),
	        /**
			   * @var generations integer how many loops we will run each solution
			   */
	        generations: 75,
	        /**
			   * @var model array the model exprerssed as in ext.m8.modelgrid.js
			   */
	        model: new Array(),
	        /**
			   * @var linearterm integer the random term of the model
			   */
	        linearterm: 0,
	        /**
	         * @var population array the model exprerssed as in ext.m8.modelgrid.js
	         */
	        population: new Array(),
	        /**
			   * @var population integer size how big do we want our initial population
			   */
	        populationsize: 750,
	        /**
	         * @var keepratio float % of best fit individuals that will survive an iteration                 
	         */
	        keepratio: 0.3,
	        /**
		   * @var random_select float % of individuals that will survive an iteration by sheer chance              
		   */
	        random_select: 0.05,
	        /**
		   * @var mutation float % of individuals that will mutate            
		   */
	        mutation: 0.01

	    };
	    /**
	     * 
	     * lets set the config object with the parameters
	     * 
	     */
	    this.config.model = model;
	    this.config.linearterm = linearterm;
	    this.config.maxValue = maxValues;
	    this.config.minValue = minValues;
	    this.config.investment = investment;
	    return this;

	}
