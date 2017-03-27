(function(){const handlebars=require("handlebars");module.exports=handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		<span>"
    + alias4(((helper = (helper = helpers.lowerLabel || (depth0 != null ? depth0.lowerLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lowerLabel","hash":{},"data":data}) : helper)))
    + "</span>\n		<input class=\"slider\"\n			data-slider-value="
    + alias4(((helper = (helper = helpers.initialValue || (depth0 != null ? depth0.initialValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"initialValue","hash":{},"data":data}) : helper)))
    + ">\n		<span class=\"right-label\">"
    + alias4(((helper = (helper = helpers.upperLabel || (depth0 != null ? depth0.upperLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"upperLabel","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		<input class=\"slider\"\n			data-slider-min="
    + alias4(((helper = (helper = helpers.min || (depth0 != null ? depth0.min : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"min","hash":{},"data":data}) : helper)))
    + "\n			data-slider-max="
    + alias4(((helper = (helper = helpers.max || (depth0 != null ? depth0.max : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"max","hash":{},"data":data}) : helper)))
    + "\n			data-slider-step="
    + alias4(((helper = (helper = helpers.step || (depth0 != null ? depth0.step : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"step","hash":{},"data":data}) : helper)))
    + "\n			data-slider-value="
    + alias4(((helper = (helper = helpers.initialValue || (depth0 != null ? depth0.initialValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"initialValue","hash":{},"data":data}) : helper)))
    + "\n			name=\"timeSlider\">\n		    <div>\n			       <label class=\"control-value-label\">"
    + alias4(((helper = (helper = helpers.initialFormattedValue || (depth0 != null ? depth0.initialFormattedValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"initialFormattedValue","hash":{},"data":data}) : helper)))
    + "</label>\n		    </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"layer-control\">\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.isTicks : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});}());