/*

   common utility library for js

   so far: queue and a stack



   */


'use strict' 

/*

   an array based queue following FIFO convention

 **MEMBER DATA**
   this.data array
   
 **METHODS**
   enqueue(item) 
   uniqueEnqueue(item)
   dequeue() -> item
   isEmpty() -> boolean
   getSize() ->number
   peek()   -> item
   printAll() 
   */

class simpleQueue
{
	constructor()
	{
		this.data = [];
	}
	isEmpty()
	{
		if(this.data.length <1)
			return true
		else
			return false
	}
	enqueue(item)
	{
		this.data.push(item)
	}
	uniqueEnqueue(item)
	{
		if(this.data.indexOf(item) == -1)
			this.data.push(item)
	}
	dequeue()
	{
		if(!this.isEmpty())
		{
			var temp = this.data[0];
			this.data = this.data.slice(1,this.data.length);
			return temp
		}

	}
	getSize()
	{
		return this.data.length

	}
	peek()
	{
		if(this.data.length == 0)
			return []
		else
		return this.data[0]


	}
	printAll()
	{
		alert("printing all items in queue");
		this.data.forEach((val)=>alert(val))

	}
}



/*
simple class stack following LIFO convention

**MEMBER DATA**
  this.data array
**METHODS**
  isEmpty() -> boolean
  poosh(item)
  pop() -> item
  getSize() -> number

   */


class simpleStack
{
	constructor()
	{
		this.data = [];

	}
	isEmpty()
	{
		if(this.data.length<1)
			return true
		else
			return false

	}
	poosh(item)
	{
		this.data.push(item)
	}

	pop()
	{
		if(!this.isEmpty())
		{
			var temp = this.data[this.data.length-1];
			this.data = this.data.slice(0, this.data.length-1)
			return temp
		}
	}
	getSize()
	{
		return this.data.length;

	}




}
/*

lil helper function to make sure i have no repeats values in my arrays.
   */
function convert2Set(inArr)
{
var tempArr = [];
inArr.forEach((elementVal) => {
		if(tempArr.indexOf(elementVal) == -1 && elementVal != "")
			tempArr.push(elementVal)
		
		})
return tempArr
}


function setAdd(item, inArr)
{
	if(inArr.indexOf(item) == -1)
		inArr.push(item)


}

/*
   splitOrEmpty(inputString, demarcationpoint)

   this function is a workaround to 
   "".split(",").length being 1

   i want it so that if i try to split a string into an array
   and if i start with an empty string, i should have an empty array,
   not an array with 1 empty string in it. 

   */
function splitOrEmpty(inString, dPoint)
{
	if(inString == "")
	{

		return []
	}
	else
	{
		return inString.split(dPoint)

	}

}

/*
addUniqueState(stateObj, dPoint, FA)
takes a state object with a .name key, a string demarcation point
and a finite acceptor object

the purpose of this function is to add a state object ONLY if 
any permutations of the same sub-elements are not already 
in the acceptor object.

example: 
A.try to push state object with .name "q1-q2"
B. find out that the acceptor object has state with .name "q2-q1"
C. do not add the new state to the acceptor 

if there had not been a "q2-q1" go ahead and add the stateobject
as a member of the acceptor object. 
   
 

 
 */
function addUniqueState(stateObj, dPoint, FA)
{
	//if incoming state has no name, don't add it
	if(stateObj.name =="")
		return;
	var newNameArr = splitOrEmpty(stateObj.name, dPoint)
	for(var key in FA)
	{
		var oldNameArr = splitOrEmpty(FA[key].name, dPoint)
		//if lengths don't match it is still a candidate
		if(newNameArr.length != oldNameArr.length)
		{
			continue;
		}
		/*
		   if the length of items is the same 
		   create a counter and add one to it
		   every time 1 of the sub items matches.
		   if the counter is the same as the 
		   length of items, it means they are the same
		   items in either the same or different ordering
		   and we should NOT add as a member to the acceptor state.

		   return without doing anything else!
		   */
		else
		{
			var lengthCounter = 0;
			newNameArr.forEach(item=>
					{
					if(oldNameArr.indexOf(item) != -1)
						lengthCounter++;					
					})
			if(lengthCounter == newNameArr.length)
				return;

		}

	}
	//if we made it through whole loop, then state name is unique
	//and we can add the state to the acceptor object
	FA[stateObj.name] = stateObj;
}
