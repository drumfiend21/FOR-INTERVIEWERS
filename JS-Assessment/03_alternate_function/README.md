# Alternate Function

## Description:

Create the function alternate that returns an object that returns a value every other time it is called.  This should sound a lot like the `once` function but with a twist!

Example:


```

var message = "";
var sayByeOnAlternateCalls = alternate(function(){
	message += "bye";
});

sayByeOnAlternateCalls() // message = "bye";

sayByeOnAlternateCalls() // message = "bye";

sayByeOnAlternateCalls() // message = "byebye";

sayByeOnAlternateCalls() // message = "byebye";

```

