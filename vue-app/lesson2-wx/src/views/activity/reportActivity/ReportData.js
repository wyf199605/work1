const ReportData = {
  baseInfo: {
    activity: {
      activityCategory: 0,
      activityLevel: '',
      activityAttribution: '',
      activityPlatform: '',
      platformCategory: '',
      activityName: '',
      slogan: '',
      address: '',
      teacherId: '',
      teacherName: '',
      teacherPosition: '',
      courseDescription: '',
      coverPicture: '',
      remind: '',
      accessory: '',
      remark: ''
    },
    sponsor: [],
    contractor: [],
    assist: [],
    charge: []
  },
  ruleSetting: {
    rule: {
      activityBeginTime: 0,
      activityEndTime: 0,
      applicationBeginTime: 0,
      applicationEndTime: 0,
      activityRetroactive: 0,
      activityRetroBeginTime: 0,
      activityRetroEndTime: 0,
      activityCancel: 0,
      activityCancelBeginTime: 0,
      activityCancelEndTime: 0,
      activitiesList: 0,
      roleCancel: 0,
      roleCancelBeginTime: 0,
      roleCancelEndTime: 0,
      activityComment: 0,
      commentEndTime: 0,
      signBack: 0,
      signBackStartTime: 0,
      signBackEndTime: 0,
      longitude: '',
      latitude: '',
      signType: 0,
      distance: 0,
      signPosition: 0,
      duration: 0
    },
    signContent: [],
    controllerType: {},
    controller: [],
    organizerType: {},
    organizer: [],
    participantType: {},
    participant: [],
    activitieList: []
  },
  objectSetting: {
    object: {
      limitCollege: -1,
      limitMajor: -1,
      limitGrade: -1,
      limitClass: -1,
      otherCollege: 0,
      otherMajor: 0,
      otherGrade: 0,
      otherClass: 0
    },
    college: [],
    major: [],
    grade: [],
    clbum: []
  }
}

export default ReportData
