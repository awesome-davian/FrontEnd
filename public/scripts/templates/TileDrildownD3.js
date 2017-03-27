(function(){const handlebars=require("handlebars");module.exports=handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "            <div class=\"drilldown-label\">\n                <span>Username: </span>\n            </div>\n            <div class=\"drilldown-item\">\n                <span>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0._source : depth0)) != null ? stack1.username : stack1), depth0))
    + "</span>\n            </div>\n            <div class=\"drilldown-label\">\n                <span>Tweet: </span>\n            </div>\n            <div class=\"drilldown-item\">\n                <span>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0._source : depth0)) != null ? stack1.text : stack1), depth0))
    + "</span>\n            </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"topic-drilldown\">\n    <div class=\"drilldown-label\">\n        <span>'"
    + container.escapeExpression(((helper = (helper = helpers.topic || (depth0 != null ? depth0.topic : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"topic","hash":{},"data":data}) : helper)))
    + "' Tweets</span>\n    </div>\n    <div class=\"drilldown-item\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tweets : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n</div>\n";
},"useData":true});}());