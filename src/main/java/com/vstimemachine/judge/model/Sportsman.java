package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Sportsman {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;
    private LocalDateTime dateCreate = LocalDateTime.now();

    private String firstName;
    private String lastName;
    private String middleName;
    private String nick;
    private String photo;
    private String city;
    private Integer age;
    private String team;
    private String phone;
    private String email;
    private String country;

    private Boolean selected = false;

    @OneToMany(cascade = CascadeType.ALL,
            mappedBy = "sportsman")
    private Set<Transponder> transponders;

    @ManyToOne
    @JoinColumn(name="competition_id")
    private Competition competition;

    @OneToMany(mappedBy = "sportsman", cascade = CascadeType.ALL)
    @OrderBy("millisecond ASC")
    private Set<Lap> laps;

    @OneToMany(mappedBy = "sportsman", cascade = CascadeType.ALL)
    private Set<GroupSportsman> groupSportsmen;

    public void addGroupSportsman(GroupSportsman groupSportsman){
        if(groupSportsmen == null) groupSportsmen = new HashSet<GroupSportsman>();
        groupSportsmen.add(groupSportsman);
    }

    public Sportsman(Sportsman sportsman) {
        this.id = sportsman.getId();
        this.version = sportsman.getVersion();
        this.dateCreate = sportsman.getDateCreate();
        this.firstName = sportsman.getFirstName();
        this.lastName = sportsman.getLastName();
        this.middleName = sportsman.getMiddleName();
        this.nick = sportsman.getNick();
        this.photo = sportsman.getPhoto();
        this.city = sportsman.getCity();
        this.age = sportsman.getAge();
        this.team = sportsman.getTeam();
        this.phone = sportsman.getPhone();
        this.email = sportsman.getEmail();
        this.country = sportsman.getCountry();
        this.selected = sportsman.getSelected();
    }
}
