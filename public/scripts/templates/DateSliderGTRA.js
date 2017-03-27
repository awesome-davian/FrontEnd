(function(){const handlebars=require("handlebars");module.exports=handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"layer-control-element-gtra date-slider-container-gtra\">\n    <div>\n    	<input class=\"slider-gtra\"\n    		data-slider-min="
    + alias4(((helper = (helper = helpers.min || (depth0 != null ? depth0.min : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"min","hash":{},"data":data}) : helper)))
    + "\n    		data-slider-max="
    + alias4(((helper = (helper = helpers.max || (depth0 != null ? depth0.max : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"max","hash":{},"data":data}) : helper)))
    + "\n    		data-slider-step="
    + alias4(((helper = (helper = helpers.step || (depth0 != null ? depth0.step : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"step","hash":{},"data":data}) : helper)))
    + "\n    		data-slider-value="
    + alias4(((helper = (helper = helpers.initialValue || (depth0 != null ? depth0.initialValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"initialValue","hash":{},"data":data}) : helper)))
    + ">\n    </div>\n    <div>\n	       <label class=\"date-label-gtra\">"
    + alias4(((helper = (helper = helpers.initialFormattedValue || (depth0 != null ? depth0.initialFormattedValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"initialFormattedValue","hash":{},"data":data}) : helper)))
    + "</label>\n    </div>\n</div>\n";
},"useData":true});}());