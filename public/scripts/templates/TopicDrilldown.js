(function(){const handlebars=require("handlebars");module.exports=handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <div class =\"topic-drilldown-item\">\n            <div class=\"topic-drilldown-alignleft\"><strong>Name: </strong>"
    + alias4(((helper = (helper = helpers.username || (depth0 != null ? depth0.username : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"username","hash":{},"data":data}) : helper)))
    + "</div>\n            <div class=\"topic-drilldown-alignright\">"
    + alias4(((helper = (helper = helpers.created_at || (depth0 != null ? depth0.created_at : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"created_at","hash":{},"data":data}) : helper)))
    + "</div>\n            <br>\n            <div class=\"topic-drilldown-text\"><strong>Tweet: </strong> "
    + alias4(((helper = (helper = helpers.texts || (depth0 != null ? depth0.texts : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"texts","hash":{},"data":data}) : helper)))
    + "</div>         \n            <br>\n            <div style=\"clear: both;\"></div>\n        </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"topic-drilldown\">    \n    <div class=\"drilldown-graph\"></div>\n    <div class=\"drilldown-label\">\n        <span>'"
    + container.escapeExpression(((helper = (helper = helpers.topic || (depth0 != null ? depth0.topic : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"topic","hash":{},"data":data}) : helper)))
    + "' Tweets</span>\n        <br>\n        <br>   \n    </div>\n    <div class=\"drilldown-item\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tweets : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n</div>\n";
},"useData":true});}());