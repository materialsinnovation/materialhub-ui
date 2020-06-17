/// Load this script to require the user to be logged in before allowing access.

// frontmatter forces jekyll to parse this 
const authdata = tryGetAuth();
if (null !== authdata){
	// do nothing, let page continue loading
} else{
	// FORCE LOGIN HERE
	alert("Login Required!");
	// TODO: is hacky bc of baseurl
	window.location.replace("/materialhub-ui/login");
}