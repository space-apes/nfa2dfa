/*
   Brian Smith
   CSC-471 
   Dr. Han
   CSU Dominguez Hills
   03/08/2018
   Project #1


   CONVERT USER DEFINED NFA TO EQUIVALENT DFA
   
   
   the purpose of this file is to create all the necessary functions to 
   


   1. take in a user-defined non-deterministic finite acceptor as an object 
   with sub-objects representing the states.
   each state will contain arrays for the various input/transition combinations, set of states teachable from 1 lambda transitions, the set of all states reachable from 0 or more lambda transitions (eClosure),as well as a boolean for whether the state is an accepting state or not.

example: 
	
	nfa = {
q0: {aTransitions:[q2,q3], bTransitions: [q2], lTransitions: [q2], eClosure:[q2,q6], accepting: false}
	
	}


      2. generate the equivalent DFA for the NFA as an array of object 
      with reduced number of members: only aTransitions, bTransitions, 
      and accepted boolean

   3. display the (initial NFA and?) DFA visually using html and css. 
      doesn't have to be pretty, but give the user something 
      that easily describes the result. maybe just old-school table tags
      with relative sizing for font and cells.

  


the newest version of this includes a fix to not count different permutations of 
compound states as separate and also the issues when gathering input having
to do with using the split method on emptry strings break a string into an array and getting an array with more than 0 items!

*/

'use strict'
var nfa = {}
var dfa = {}

var testCaseA = {
q0:{aTransitions:["q0","q1"], bTransitions:[], lTransitions:[], eClosure:[], accepting:false},

q1:{aTransitions:[], bTransitions:["q1", "q2"], lTransitions:[], eClosure:[], accepting:true},

q2:{aTransitions:["q2"], bTransitions:[], lTransitions:[], eClosure:[], accepting:false}

}

var testCaseB = {

q0:{aTransitions:["q0", "q1"], bTransitions:[], lTransitions:["q2"], eClosure:[], accepting:false},

q1:{aTransitions:[], bTransitions:["q1", "q2"], lTransitions:[], eClosure:[], accepting:true},

q2:{aTransitions:["q2"], bTransitions:[], lTransitions:[], eClosure:[], accepting:false}
}

var testCaseC = {

q0:{aTransitions:["q0", "q1"], bTransitions:[], lTransitions:[], eClosure:[], accepting:false},

q1:{aTransitions:[], bTransitions:["q1", "q2"], lTransitions:["q1", "q2"], eClosure:[], accepting:true},

q2:{aTransitions:["q2"], bTransitions:[], lTransitions:[], eClosure:[], accepting:false}
}

var testCaseD = 
{

q0:{aTransitions:["q0", "q1"], bTransitions:["q1"], lTransitions:[], eClosure:[], accepting:false},

q1:{aTransitions:["q2"], bTransitions:["q2"], lTransitions:[], eClosure:[], accepting:true},

q2:{aTransitions:[], bTransitions:["q2"], lTransitions:[], eClosure:[], accepting:false}
}

/*
NFAsubmit()

1. clears the nfa table
2. runs addClosures() on global nfa
3. passes the global nfa to nfa2Dfa(), returns that value to global dfa,
4. pass both nfa and dfa globals to tableRender() function

   */
function NFASubmit()
{
	document.getElementById("nfaTable").innerHTML = "<tr><th></th><th>a</th><th>b</th><th>lambda</th><th>e-closure</th><th>accepting?</th>";
	addClosures(nfa);
	dfa = nfa2Dfa(nfa);
	tableRender(nfa, dfa)	

}

/*
stateSubmit: 

1. populates a temporary state object 
{
name:
aTransitions:
bTransitions:
accepting:
}

2. draws those values into the table,
3. adds that state as a member of nfa global variable,
4. clears input fields 

*/

function stateSubmit()
{
var inState = {}
if(nfa["q0"])
{
inState = {
name: document.getElementById("stateName").value,
aTransitions: splitOrEmpty(document.getElementById("aTransitions").value, ","),
bTransitions: splitOrEmpty(document.getElementById("bTransitions").value, ","),
lTransitions: splitOrEmpty(document.getElementById("lTransitions").value, ","),
accepting: document.getElementById("accepting").value 
}

}
else
{
inState = {
name: "q0",
aTransitions: splitOrEmpty(document.getElementById("aTransitions").value, ","),
bTransitions: splitOrEmpty(document.getElementById("bTransitions").value, ","),
lTransitions: splitOrEmpty(document.getElementById("lTransitions").value, ","),
accepting: document.getElementById("accepting").value
}


document.getElementById("stateName").style.display = "inline";

document.getElementById("stateNameLabel").style.display = "inline";
}


iterativeDraw(inState)
nfa[inState.name] = inState
clearInputs();
}

function iterativeDraw(stateObject)
{
document.getElementById("nfaTable").innerHTML += '<tr> <th>'+stateObject.name+'</th><td>'+stateObject.aTransitions.join(",")+'</td><td>'+stateObject.bTransitions.join(",")+'</td><td>'+stateObject.lTransitions.join(',')+'</td><td></td><td>'+stateObject.accepting+'</td>'


}

/*
Example function to produce dfa from hard-coded nfa input

for inputCase will use testCaseA, testCaseB, testCaseC, testCaseD

    -sets nfa global to whatever the input nfa is
    -adds e-closure field to nfa structure
    -generates dfa from nfa
    -renders results on screen

   */
function example(inputCase)
{
	clearAll();
        nfa = inputCase
	addClosures(nfa)
	dfa = nfa2Dfa(nfa)
	tableRender(nfa,dfa)

}


function clearAll(){
nfa = {};
dfa = {};
document.getElementById("nfaTable").innerHTML = "<tr><th></th><th>a</th><th>b</th><th>lambda</th><th>e-closure</th><th>accepting?</th>";
document.getElementById("dfaTable").innerHTML = "<tr><th></th><th>a</th><th>b</th><th>accepting?</th></tr>";
clearInputs()

document.getElementById("stateNameLabel").style.display = "none";
document.getElementById("stateName").style.display = "none";
}

function clearInputs()
{
Array.from(document.getElementsByTagName("INPUT")).forEach((inputTag)=>inputTag.value = "")
document.getElementById("true").selected = true
}




/*
   this function takes in an nfa and adds the appropriate eclosure set to each
   state. it  goes state by state
   	0. adding in that state name, as any eclosure includes at least 
	itself.

   	1. adding each unique item from it's lambda transition list
		to the e-closure set. 
	2. if any new item was added, that item
		is added to a queue.
	
	3.at the end of each cycle, it dequeues 1 item.

	finally, after each state is finished, it moves to the next state.

	by doing a sort of breadth-wise first method, and checking if 
	new states are already accounted for, we can make sure we get every
	lambda transition from a given state. 


   */



function addClosures(inNfa)
{
	var eClosure = []
	var lambdaQueue = new simpleQueue()
	
	//alert("inNfa[q0].lTransitions is: "+inNfa["q0"].lTransitions)
	for(var key in inNfa)
	{
		//eclosure always includes self
		eClosure = [key]
		
		lambdaQueue.enqueue(key)
		while(lambdaQueue.isEmpty() == false)
		{		
			//alert("lambdaqueue top is "+lambdaQueue.peek())
			inNfa[lambdaQueue.peek()].lTransitions.forEach((val)=>{
					if(eClosure.indexOf(val) == -1 && inNfa[val])
					{
					//alert("adding "+val)
					eClosure.push(val);
					lambdaQueue.enqueue(val)
					}
					})
		lambdaQueue.dequeue()
		}
			
	inNfa[key].eClosure = eClosure;
	}
}



function tableRender(inNfa,inDfa)
{
for(var key in inNfa)
{
	document.getElementById("nfaTable").innerHTML += '<tr> <th>'+key+'</th><td>'+inNfa[key].aTransitions.join(",")+'</td><td>'+inNfa[key].bTransitions.join(",")+'</td><td>'+inNfa[key].lTransitions.join(',')+'</td><td>'+inNfa[key].eClosure.join(',')+'</td><td>'+inNfa[key].accepting+'</td>'

}

for(var key in inDfa)
{

 document.getElementById("dfaTable").innerHTML += '<tr> <th>'+key+'</th><td>'+inDfa[key].aTransitions.join("_")+'</td><td>'+inDfa[key].bTransitions.join("_")+'</td><td>'+inDfa[key].accepting+'</td>'
}


}


/*
   converts incoming nfa to equivalent dfa by doing work on 
   queue of states until the queue is empty
   	
   begin by enqueueing concatenation of nfa's eclosure to the 
   statequeue

   WHILE STATEQUEUE IS NOT EMPTY
   		create tempState set it's name  to front of queue
		set nextStateString to ""
		create transition set set (tset) to []
   		
		if state has been visited, simply dequeue	
	
	FOR EACH SPLIT ELEMENT OF tempstate.name

   		A. for aTransitions, add the nfa's atransitions, 
		as well as eclosures for each of aTransitions to a set
		A1. IF set is empty, 
			generate a trap state, 
			set tempState.aTransitions = ["qT"]

		
		A2. ELSE check if any item in set is an accepting state,
			if so flag the tempState to be accepting
		A3. set tempState.aTransitions to concatenation of this set
		
		B1. set nextStateBuffer to "", set tset to []
		
		B2. do all the same for bStransitions

		C. add tempstate as element to outDFA object

		D. dequeue statequeue


		WHEN STATEQUEUE IS EMPTY 
		E. return outDfa object

		F. have a happy life 	
	****************************************
   */

function nfa2Dfa(inNfa)
{
	
	var tset = []
	var stateQueue = new simpleQueue()
	var currentStateNameBuffer=""
	var nextStateNameBuffer= ""
	var tempState = {}
	var outDfa = {}
	var stateQueueIterations = 0
stateQueue.enqueue(inNfa.q0.eClosure.join('_'))
//alert("eClosure received for initial state is: "+inNfa.q0.eClosure.join("-"))	
while(!stateQueue.isEmpty())
{




	//alert("head of queue at beginning of loop: "+stateQueue.peek())
	tempState = {name: stateQueue.peek(), accepting:false}

	//if already visited, just dequeue
	if(outDfa[tempState.name] || tempState.name == "")
	{
		//alert("already have a state indfa by the name: "+stateQueue.peek())
		stateQueue.dequeue()
		continue;
	}
	//add aTransitions
	//
	stateQueue.enqueue(addDfaTransitions("aTransitions", tempState, inNfa, outDfa))
	
	//alert("head of queue after atransitions: "+stateQueue.peek())
	//add bTransitions
	stateQueue.enqueue(addDfaTransitions("bTransitions", tempState, inNfa, outDfa))
	
	//stateQueue.printAll();
	//alert("head of queue after btransitions: "+stateQueue.peek())
	//add temp state to the outgoing Dfa
	
	//outDfa[tempState.name] = tempState
	addUniqueState(tempState, "_", outDfa)
}
	//finally, return the resulting dfa object
	return outDfa

}



function addDfaTransitions(inputName, theTempState, theInNfa, theOutDfa) 
{
	var tset = []
	
	//break state name to comprising elements
	//check if each is an accepting
	//add each ones inputName transitions to array tset
	//add eclosure set of each of those to array tset

	theTempState.name.split("_").forEach((parsedState)=>{
			//alert("parsed state is: "+parsedState)
			
			if(parsedState != "")
			{
			if(theInNfa[parsedState].accepting)
			{
				theTempState.accepting = true;
			}
			
			
			//alert("parsed state is: "+parsedState+" inputname is "+inputName+"\n transition set is \n"+theInNfa[parsedState][inputName]+"\n typeof transition set is "+typeof theInNfa[parsedState][inputName])
			tset = tset.concat(theInNfa[parsedState][inputName])
			//theInNfa[parsedState][inputName].forEach((val)=>alert("foreach alert of empty set"+val))
			theInNfa[parsedState][inputName].forEach((transitionsForClosures)=>{tset=tset.concat(theInNfa[transitionsForClosures].eClosure)
					})
			
				
			}
			})
	//get rid of redundant elements

	tset = convert2Set(tset);

	//alert("after first transition step, tset is"+tset)
	//if transition set is empty, create trap state 
	//and set the current State's current transition to it
	//return with no further work
	if(tset.length == 0)
	{		
		theOutDfa["qT"] = {name: "qT", aTransitions: ["qT"], bTransitions:["qT"], accepting:false}
	
	theTempState[inputName] = ["qT"]	
	return theTempState.name
	}

	//return composite of all transitions for this given input
	//as a string joined by a hyphen. this will be added to the 
	//the stateQueue
	else{
		theTempState[inputName] = tset	
		//alert("right before returning, tset.join with dash is "+tset.join("-"))
		return tset.join("_")
	}
}

