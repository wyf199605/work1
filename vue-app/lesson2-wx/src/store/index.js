import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import report from './modules/report'
import course from './modules/course'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        report,
        course
    },
    getters
})
export default store
